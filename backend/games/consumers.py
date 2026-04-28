import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import Game, Move, GameStatus


class GameConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer для реального времени:
    ws://localhost:8000/ws/game/<game_id>/
    """

    async def connect(self):
        self.game_id   = self.scope["url_route"]["kwargs"]["game_id"]
        self.room_name = f"game_{self.game_id}"

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()
        await self.send_json({"type": "connected", "game_id": self.game_id})

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive_json(self, content):
        msg_type = content.get("type")

        if msg_type == "move":
            await self.handle_move(content)
        elif msg_type == "resign":
            await self.handle_resign(content)
        elif msg_type == "ping":
            await self.send_json({"type": "pong"})

    

    async def handle_move(self, content):
        san = content.get("san", "")
        uci = content.get("uci", "")
        fen_after = content.get("fen_after", "")
        move_number = content.get("move_number", 1)

        await self.save_move(san, uci, fen_after, move_number)

        
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type":"game.move",
                "san": san,
                "uci": uci,
                "fen_after": fen_after,
                "move_number": move_number,
                "player": self.scope["user"].username,
            },
        )

    async def handle_resign(self, content):
        color = content.get("color", "white")
        result = "black_win" if color == "white" else "white_win"
        await self.finish_game(result)
        await self.channel_layer.group_send(
            self.room_name,
            {"type": "game.finished", "result": result, "reason": "resignation"},
        )

    

    async def game_move(self, event):
        await self.send_json({**event, "type": "move"})

    async def game_finished(self, event):
        await self.send_json({**event, "type": "game_over"})

    

    @database_sync_to_async
    def save_move(self, san, uci, fen_after, move_number):
        game = Game.objects.get(pk=self.game_id)
        Move.objects.create(
            game=game,
            player=self.scope["user"],
            san=san, uci=uci,
            fen_after=fen_after,
            move_number=move_number,
        )
        game.current_fen = fen_after
        if game.status == GameStatus.WAITING:
            game.status     = GameStatus.PLAYING
            game.started_at = timezone.now()
        game.save(update_fields=["current_fen", "status", "started_at"])

    @database_sync_to_async
    def finish_game(self, result):
        Game.objects.filter(pk=self.game_id).update(
            status=GameStatus.FINISHED,
            result=result,
            finished_at=timezone.now(),
        )


class RoomConsumer(AsyncJsonWebsocketConsumer):
    """
    UUID-based room for QR-invite games — no DB required.
    ws://localhost:8000/ws/room/<room_id>/
    """

    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_name = f"room_{self.room_id}"
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()
        await self.send_json({"type": "connected", "room_id": self.room_id})

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive_json(self, content):
        msg_type = content.get("type")
        if msg_type == "move":
            await self.channel_layer.group_send(
                self.room_name,
                {
                    "type": "room.move",
                    "san": content.get("san", ""),
                    "uci": content.get("uci", ""),
                    "fen_after": content.get("fen_after", ""),
                    "move_number": content.get("move_number", 1),
                    "player": content.get("player", ""),
                },
            )
        elif msg_type == "join":
            await self.channel_layer.group_send(
                self.room_name,
                {"type": "room.join", "player": content.get("player", "Qonaq")},
            )
        elif msg_type == "resign":
            await self.channel_layer.group_send(
                self.room_name,
                {"type": "room.finished", "result": content.get("result", ""), "reason": "resignation"},
            )
        elif msg_type == "ping":
            await self.send_json({"type": "pong"})

    async def room_move(self, event):
        await self.send_json({**event, "type": "move"})

    async def room_join(self, event):
        await self.send_json({**event, "type": "player_joined"})

    async def room_finished(self, event):
        await self.send_json({**event, "type": "game_over"})
