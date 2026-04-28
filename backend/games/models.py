from django.db import models
from django.contrib.auth.models import User


class GameStatus(models.TextChoices):
    WAITING  = "waiting",  "Ожидание соперника"
    PLAYING  = "playing",  "В процессе"
    FINISHED = "finished", "Завершена"
    ABORTED  = "aborted",  "Прервана"


class GameResult(models.TextChoices):
    WHITE_WIN = "white_win", "Победа белых"
    BLACK_WIN = "black_win", "Победа чёрных"
    DRAW      = "draw",      "Ничья"


class Game(models.Model):
    white_player = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name="games_as_white",
    )
    black_player = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name="games_as_black",
    )
    status = models.CharField(max_length=10, choices=GameStatus.choices, default=GameStatus.WAITING)
    result = models.CharField(max_length=10, choices=GameResult.choices, null=True, blank=True)
    pgn = models.TextField(blank=True, help_text="PGN-запись партии")
    current_fen  = models.TextField(default="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    time_control = models.PositiveIntegerField(default=600, help_text="Контроль времени в секундах")
    is_deep_work = models.BooleanField(default=False, help_text="Партия сыграна в режиме Deep Work")

    created_at  = models.DateTimeField(auto_now_add=True)
    started_at  = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Партия"
        verbose_name_plural = "Партии"

    def __str__(self) -> str:
        w = self.white_player.username if self.white_player else "?"
        b = self.black_player.username if self.black_player else "?"
        return f"{w} vs {b} [{self.status}]"


class Move(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="moves")
    player = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    san = models.CharField(max_length=10, help_text="Ход в SAN-нотации")
    uci = models.CharField(max_length=6,  help_text="UCI: e.g. e2e4")
    fen_after = models.TextField()
    move_number = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["move_number", "created_at"]
        verbose_name  = "Ход"
        verbose_name_plural = "Ходы"

    def __str__(self) -> str:
        return f"#{self.move_number} {self.san}"
