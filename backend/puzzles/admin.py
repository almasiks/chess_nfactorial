from django.contrib import admin
from .models import Puzzle, PuzzleSolve


@admin.register(Puzzle)
class PuzzleAdmin(admin.ModelAdmin):
    list_display  = ("__str__", "rating", "is_daily", "date", "created_at")
    list_filter   = ("difficulty", "is_daily")
    search_fields = ("title", "lichess_id", "themes")
    ordering      = ("-date",)


@admin.register(PuzzleSolve)
class PuzzleSolveAdmin(admin.ModelAdmin):
    list_display  = ("user", "puzzle", "solved_at")
    list_filter   = ("solved_at",)
    raw_id_fields = ("user", "puzzle")
