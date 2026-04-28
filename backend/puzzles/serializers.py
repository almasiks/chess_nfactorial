from rest_framework import serializers
from .models import Puzzle, PuzzleSolve


class PuzzleSerializer(serializers.ModelSerializer):
    difficulty_display = serializers.CharField(source="get_difficulty_display", read_only=True)
    solved_by_me       = serializers.SerializerMethodField()

    class Meta:
        model  = Puzzle
        fields = [
            "id", "lichess_id", "fen", "solution_moves",
            "difficulty", "difficulty_display", "themes",
            "title", "rating", "is_daily", "date",
            "solved_by_me",
        ]

    def get_solved_by_me(self, obj) -> bool:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.solves.filter(user=request.user).exists()


class PuzzleSolveSerializer(serializers.Serializer):
    moves = serializers.ListField(child=serializers.CharField(max_length=6), min_length=1)
