import datetime
import urllib.request
import json as json_lib

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import Puzzle, PuzzleSolve
from .serializers import PuzzleSerializer, PuzzleSolveSerializer

ASYQ_REWARD = 20


def _fetch_lichess_daily() -> dict | None:
    """Загружает ежедневный пазл с публичного Lichess API."""
    try:
        req = urllib.request.Request(
            "https://lichess.org/api/puzzle/daily",
            headers={"Accept": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json_lib.loads(resp.read())
    except Exception:
        return None


def _get_or_create_daily_puzzle() -> Puzzle | None:
    today = timezone.localdate()

    puzzle = Puzzle.objects.filter(is_daily=True, date=today).first()
    if puzzle:
        return puzzle

    data = _fetch_lichess_daily()
    if not data:
        return Puzzle.objects.filter(is_daily=True).order_by("-date").first()

    p = data.get("puzzle", {})
    g = data.get("game", {})

    lichess_id = p.get("id", "")
    existing = Puzzle.objects.filter(lichess_id=lichess_id).first()
    if existing:
        existing.is_daily = True
        existing.date = today
        existing.save(update_fields=["is_daily", "date"])
        return existing

    Puzzle.objects.filter(is_daily=True).update(is_daily=False)

    return Puzzle.objects.create(
        lichess_id=lichess_id,
        fen=g.get("fen", ""),
        solution_moves=p.get("solution", []),
        themes=" ".join(p.get("themes", [])),
        rating=p.get("rating", 1500),
        title="Батыр сынағы — " + today.strftime("%d.%m.%Y"),
        is_daily=True,
        date=today,
        difficulty="medium",
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def daily_puzzle_view(request):
    """GET /api/puzzles/daily/ — возвращает сегодняшний пазл с Lichess."""
    puzzle = _get_or_create_daily_puzzle()
    if not puzzle:
        return Response({"detail": "Пазл временно недоступен."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    return Response(PuzzleSerializer(puzzle, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def solve_puzzle_view(request, pk):
    """POST /api/puzzles/<id>/solve/ — отправить решение, получить Асыки."""
    try:
        puzzle = Puzzle.objects.get(pk=pk)
    except Puzzle.DoesNotExist:
        return Response({"detail": "Задача не найдена."}, status=status.HTTP_404_NOT_FOUND)

    if PuzzleSolve.objects.filter(user=request.user, puzzle=puzzle).exists():
        return Response({"detail": "Вы уже решили эту задачу.", "already_solved": True})

    ser = PuzzleSolveSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    moves = ser.validated_data["moves"]

    correct = puzzle.solution_moves
    if moves[: len(correct)] == correct:
        PuzzleSolve.objects.create(user=request.user, puzzle=puzzle, moves_used=moves)
        profile = request.user.profile
        profile.award_asyqs(ASYQ_REWARD, reason=f"Решена задача #{puzzle.pk}")
        profile.xp += 30
        profile.save(update_fields=["xp"])
        profile.level_up_check()
        return Response({"correct": True, "asyqs_awarded": ASYQ_REWARD})

    return Response({"correct": False, "asyqs_awarded": 0})
