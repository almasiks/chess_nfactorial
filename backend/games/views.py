from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Game
from .serializers import GameSerializer, MoveSerializer


class GameListCreateView(generics.ListCreateAPIView):
    """GET /api/games/  — список партий пользователя. POST — создать новую."""
    serializer_class   = GameSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Game.objects.filter(
            white_player=user
        ) | Game.objects.filter(black_player=user)

    def perform_create(self, serializer):
        serializer.save(white_player=self.request.user)


class GameDetailView(generics.RetrieveAPIView):
    """GET /api/games/<id>/"""
    serializer_class   = GameSerializer
    permission_classes = [IsAuthenticated]
    queryset           = Game.objects.all()


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def make_move_view(request, game_id):
    """POST /api/games/<id>/move/ — записать ход (WebSocket предпочтительнее)."""
    try:
        game = Game.objects.get(pk=game_id)
    except Game.DoesNotExist:
        return Response({"detail": "Партия не найдена."}, status=status.HTTP_404_NOT_FOUND)

    serializer = MoveSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    move = serializer.save(game=game, player=request.user)
    return Response(MoveSerializer(move).data, status=status.HTTP_201_CREATED)
