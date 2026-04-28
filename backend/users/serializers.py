from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Profile, AsyqTransaction, Friendship, Subscription, PlayerLevel, KazakhCity, SubscriptionTier


class AsyqTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AsyqTransaction
        fields = ["id", "amount", "reason", "created_at"]
        read_only_fields = fields


class ProfileSerializer(serializers.ModelSerializer):
    games_lost = serializers.IntegerField(read_only=True)
    win_rate   = serializers.FloatField(read_only=True)
    username   = serializers.CharField(source="user.username", read_only=True)
    email      = serializers.EmailField(source="user.email", read_only=True)

    # Human-readable choices for frontend display
    level_display = serializers.CharField(source="get_level_display", read_only=True)
    city_display  = serializers.CharField(source="get_city_display",  read_only=True)

    class Meta:
        model  = Profile
        fields = [
            "id", "username", "email",
            "level", "level_display",
            "xp", "rating",
            "asyqs",
            "is_pro", "pro_expires_at",
            "city", "city_display",
            "push_notifications_enabled",
            "onboarding_completed",
            "games_played", "games_won", "games_drawn", "games_lost",
            "total_focus_minutes", "win_rate",
            "avatar",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "username", "email", "xp", "rating", "asyqs",
            "is_pro", "pro_expires_at", "games_played", "games_won",
            "games_drawn", "games_lost", "total_focus_minutes", "win_rate",
            "level_display", "city_display", "created_at", "updated_at",
        ]


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Эндпоинт для обновления разрешённых полей профиля."""
    class Meta:
        model  = Profile
        fields = [
            "level", "city", "push_notifications_enabled",
            "push_subscription_json", "avatar",
        ]


class OnboardingSerializer(serializers.Serializer):
    """Один запрос завершает онбординг: выбор уровня + города."""
    level = serializers.ChoiceField(choices=PlayerLevel.choices)
    city  = serializers.ChoiceField(choices=KazakhCity.choices)

    def save(self, **kwargs):
        profile = self.context["profile"]
        profile.level                = self.validated_data["level"]
        profile.city                 = self.validated_data["city"]
        profile.onboarding_completed = True
        profile.save(update_fields=["level", "city", "onboarding_completed"])
        return profile


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label="Confirm password")
    city      = serializers.ChoiceField(choices=KazakhCity.choices, required=False, default=KazakhCity.ALMATY)

    class Meta:
        model  = User
        fields = ["username", "email", "password", "password2", "city"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Пароли не совпадают."})
        return attrs

    def create(self, validated_data):
        city = validated_data.pop("city", KazakhCity.ALMATY)
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        user.profile.city = city
        user.profile.save(update_fields=["city"])
        return user


class PushSubscriptionSerializer(serializers.Serializer):
    """Сохраняет Web Push subscription с браузера."""
    subscription = serializers.JSONField()
    enabled      = serializers.BooleanField(default=True)

    def save(self, **kwargs):
        profile = self.context["profile"]
        profile.push_subscription_json      = self.validated_data["subscription"]
        profile.push_notifications_enabled  = self.validated_data["enabled"]
        profile.save(update_fields=["push_subscription_json", "push_notifications_enabled"])
        return profile


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")
    city_display = serializers.CharField(source="get_city_display")

    class Meta:
        model  = Profile
        fields = ["id", "username", "rating", "asyqs", "level", "city", "city_display", "games_won"]


class PlayerSearchSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")
    level_display = serializers.CharField(source="get_level_display")

    class Meta:
        model  = Profile
        fields = ["id", "username", "rating", "level", "level_display", "avatar"]


class FriendshipSerializer(serializers.ModelSerializer):
    sender_username   = serializers.CharField(source="sender.username", read_only=True)
    receiver_username = serializers.CharField(source="receiver.username", read_only=True)

    class Meta:
        model  = Friendship
        fields = ["id", "sender_username", "receiver_username", "status", "challenge_token", "created_at"]
        read_only_fields = ["id", "sender_username", "receiver_username", "status", "challenge_token", "created_at"]


class SubscriptionSerializer(serializers.ModelSerializer):
    tier_display   = serializers.CharField(source="get_tier_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model  = Subscription
        fields = ["id", "tier", "tier_display", "status", "status_display",
                  "started_at", "expires_at", "payment_ref", "auto_renew"]
        read_only_fields = ["id", "status", "started_at", "expires_at", "payment_ref"]


class SubscribeSerializer(serializers.Serializer):
    tier        = serializers.ChoiceField(choices=SubscriptionTier.choices)
    payment_ref = serializers.CharField(max_length=64, required=False, default="DEMO-KASPI-REF")
