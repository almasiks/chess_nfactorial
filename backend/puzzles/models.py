from django.db import models
from django.contrib.auth.models import User


class PuzzleDifficulty(models.TextChoices):
    EASY   = "easy",   "Жеңіл"
    MEDIUM = "medium", "Орташа"
    HARD   = "hard",   "Қиын"


class Puzzle(models.Model):
    lichess_id     = models.CharField(max_length=16, blank=True, null=True, unique=True)
    fen            = models.TextField(help_text="Начальная позиция FEN (ход соперника уже сделан)")
    solution_moves = models.JSONField(help_text="Список ходов UCI: ['e2e4', 'd7d5']")
    difficulty     = models.CharField(max_length=8, choices=PuzzleDifficulty.choices, default=PuzzleDifficulty.MEDIUM)
    themes         = models.CharField(max_length=255, blank=True, help_text="Теги через пробел: fork pin mateIn2")
    title          = models.CharField(max_length=128, blank=True)
    rating         = models.PositiveIntegerField(default=1500)
    is_daily       = models.BooleanField(default=False, db_index=True)
    date           = models.DateField(null=True, blank=True, db_index=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering            = ["-date", "-created_at"]
        verbose_name        = "Задача"
        verbose_name_plural = "Задачи"

    def __str__(self) -> str:
        tag = f"[{self.lichess_id}]" if self.lichess_id else f"[#{self.pk}]"
        return f"{tag} {self.title or self.themes} ({self.get_difficulty_display()})"


class PuzzleSolve(models.Model):
    """Фиксирует решение задачи пользователем и начисление Асыков."""
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name="puzzle_solves")
    puzzle     = models.ForeignKey(Puzzle, on_delete=models.CASCADE, related_name="solves")
    moves_used = models.JSONField(help_text="Ходы, которые ввёл пользователь")
    solved_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together     = [("user", "puzzle")]
        ordering            = ["-solved_at"]
        verbose_name        = "Решение задачи"
        verbose_name_plural = "Решения задач"

    def __str__(self) -> str:
        return f"{self.user.username} → {self.puzzle}"
