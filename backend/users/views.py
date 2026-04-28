import secrets
import datetime

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile, Friendship, Subscription, FriendshipStatus, SubscriptionTier, SubscriptionStatus
from .serializers import (
    ProfileSerializer,
    ProfileUpdateSerializer,
    OnboardingSerializer,
    RegisterSerializer,
    PushSubscriptionSerializer,
    LeaderboardEntrySerializer,
    PlayerSearchSerializer,
    FriendshipSerializer,
    SubscriptionSerializer,
    SubscribeSerializer,
)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """POST /api/users/login/  — email + password → JWT tokens"""
    email    = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")
    if not email or not password:
        return Response({"detail": "Email и пароль обязательны."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"detail": "Неверный email или пароль."}, status=status.HTTP_400_BAD_REQUEST)
    if not user.check_password(password):
        return Response({"detail": "Неверный email или пароль."}, status=status.HTTP_400_BAD_REQUEST)
    if not user.is_active:
        return Response({"detail": "Аккаунт отключён."}, status=status.HTTP_403_FORBIDDEN)
    refresh = RefreshToken.for_user(user)
    return Response({
        "user":    ProfileSerializer(user.profile).data,
        "refresh": str(refresh),
        "access":  str(refresh.access_token),
    })


class RegisterView(generics.CreateAPIView):
    """POST /api/users/register/"""
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": ProfileSerializer(user.profile).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED,
        )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """GET /api/users/me/  — PATCH /api/users/me/"""
    profile = request.user.profile
    if request.method == "GET":
        return Response(ProfileSerializer(profile).data)

    serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(ProfileSerializer(profile).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def onboarding_view(request):
    """POST /api/users/onboarding/"""
    profile = request.user.profile
    if profile.onboarding_completed:
        return Response({"detail": "Онбординг уже пройден."}, status=status.HTTP_400_BAD_REQUEST)
    serializer = OnboardingSerializer(data=request.data, context={"profile": profile})
    serializer.is_valid(raise_exception=True)
    profile = serializer.save()
    return Response(ProfileSerializer(profile).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def push_subscription_view(request):
    """POST /api/users/push-subscription/"""
    profile = request.user.profile
    serializer = PushSubscriptionSerializer(data=request.data, context={"profile": profile})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({"detail": "Подписка сохранена."})


@api_view(["GET"])
@permission_classes([AllowAny])
def leaderboard_view(request):
    """GET /api/users/leaderboard/?city=almaty"""
    city = request.query_params.get("city")
    qs = Profile.objects.select_related("user").order_by("-rating")
    if city:
        qs = qs.filter(city=city)
    qs = qs[:50]
    return Response(LeaderboardEntrySerializer(qs, many=True).data)


# ── Player Search ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def player_search_view(request):
    """GET /api/users/search/?q=username — поиск игрока по имени."""
    q = request.query_params.get("q", "").strip()
    if len(q) < 2:
        return Response({"detail": "Минимум 2 символа."}, status=status.HTTP_400_BAD_REQUEST)

    profiles = (
        Profile.objects.select_related("user")
        .filter(user__username__icontains=q)
        .exclude(user=request.user)[:20]
    )
    return Response(PlayerSearchSerializer(profiles, many=True).data)


# ── Friendships & Challenges ─────────────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def friendship_list_view(request):
    """
    GET  /api/users/friends/   — список друзей
    POST /api/users/friends/   — отправить запрос в друзья / вызов на партию
                                 body: { "receiver_username": "..." }
    """
    if request.method == "GET":
        sent     = Friendship.objects.filter(sender=request.user, status=FriendshipStatus.ACCEPTED)
        received = Friendship.objects.filter(receiver=request.user, status=FriendshipStatus.ACCEPTED)
        all_fs   = list(sent) + list(received)
        return Response(FriendshipSerializer(all_fs, many=True).data)

    receiver_username = request.data.get("receiver_username", "")
    try:
        receiver = User.objects.get(username=receiver_username)
    except User.DoesNotExist:
        return Response({"detail": "Игрок не найден."}, status=status.HTTP_404_NOT_FOUND)

    if receiver == request.user:
        return Response({"detail": "Нельзя вызвать самого себя."}, status=status.HTTP_400_BAD_REQUEST)

    fs, created = Friendship.objects.get_or_create(
        sender=request.user,
        receiver=receiver,
        defaults={"challenge_token": secrets.token_hex(16)},
    )
    if not created:
        return Response({"detail": "Запрос уже отправлен.", "token": fs.challenge_token})

    return Response(
        {"detail": "Вызов отправлен!", "token": fs.challenge_token},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def friendship_respond_view(request, pk):
    """POST /api/users/friends/<id>/respond/  body: { "action": "accept"|"decline" }"""
    try:
        fs = Friendship.objects.get(pk=pk, receiver=request.user)
    except Friendship.DoesNotExist:
        return Response({"detail": "Запрос не найден."}, status=status.HTTP_404_NOT_FOUND)

    action = request.data.get("action")
    if action == "accept":
        fs.status = FriendshipStatus.ACCEPTED
        fs.save(update_fields=["status"])
        return Response({"detail": "Принято!"})
    elif action == "decline":
        fs.status = FriendshipStatus.DECLINED
        fs.save(update_fields=["status"])
        return Response({"detail": "Отклонено."})

    return Response({"detail": "action должен быть 'accept' или 'decline'."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_challenges_view(request):
    """GET /api/users/friends/pending/ — входящие вызовы."""
    qs = Friendship.objects.filter(receiver=request.user, status=FriendshipStatus.PENDING)
    return Response(FriendshipSerializer(qs, many=True).data)


# ── Subscription ──────────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def subscription_view(request):
    """
    GET  /api/users/subscription/  — текущая подписка
    POST /api/users/subscription/  — оформить / сменить подписку (mock payment)
                                     body: { "tier": "sultan"|"great_khan", "payment_ref": "..." }
    """
    if request.method == "GET":
        sub, _ = Subscription.objects.get_or_create(user=request.user)
        return Response(SubscriptionSerializer(sub).data)

    ser = SubscribeSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    tier = ser.validated_data["tier"]
    ref  = ser.validated_data["payment_ref"]

    sub, _ = Subscription.objects.get_or_create(user=request.user)
    sub.tier        = tier
    sub.status      = SubscriptionStatus.ACTIVE
    sub.payment_ref = ref
    sub.expires_at  = timezone.now() + datetime.timedelta(days=30)
    sub.save()

    # Sync is_pro on Profile
    profile = request.user.profile
    profile.is_pro         = tier in (SubscriptionTier.SULTAN, SubscriptionTier.GREAT_KHAN)
    profile.pro_expires_at = sub.expires_at
    profile.save(update_fields=["is_pro", "pro_expires_at"])

    return Response(SubscriptionSerializer(sub).data, status=status.HTTP_200_OK)
