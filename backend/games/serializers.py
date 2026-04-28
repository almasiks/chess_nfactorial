from rest_framework import serializers
from .models import Game, Move


class MoveSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Move
        fields = ["id", "san", "uci", "fen_after", "move_number", "created_at"]
        read_only_fields = ["id", "created_at"]


class GameSerializer(serializers.ModelSerializer):
    moves             = MoveSerializer(many=True, read_only=True)
    white_username    = serializers.CharField(source="white_player.username", read_only=True, default=None)
    black_username    = serializers.CharField(source="black_player.username", read_only=True, default=None)

    class Meta:
        model  = Game
        fields = [
            "id", "white_player", "white_username",
            "black_player", "black_username",
            "status", "result", "pgn", "current_fen",
            "time_control", "is_deep_work",
            "moves", "created_at", "started_at", "finished_at",
        ]
        read_only_fields = ["id", "white_player", "created_at", "started_at", "finished_at"]
