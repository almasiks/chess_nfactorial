from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class KazakhCity(models.TextChoices):
    ALMATY          = "almaty",          "Алматы"
    ASTANA          = "astana",          "Астана"
    SHYMKENT        = "shymkent",        "Шымкент"
    KARAGANDA       = "karaganda",       "Қарағанды"
    AKTOBE          = "aktobe",          "Ақтөбе"
    TARAZ           = "taraz",           "Тараз"
    PAVLODAR        = "pavlodar",        "Павлодар"
    UST_KAMENOGORSK = "ust_kamenogorsk", "Өскемен"
    SEMEY           = "semey",           "Семей"
    ATYRAU          = "atyrau",          "Атырау"
    OTHER           = "other",           "Басқа қала"


class PlayerLevel(models.TextChoices):
    NOMAD  = "nomad",  "Номад"   # Начинающий — «Только начинаю путь в Великой Степи»
    SARBAZ = "sarbaz", "Сарбаз"  # Базовый    — «Знаю основы и правила сражения»
    BATYR  = "batyr",  "Батыр"   # Продвинутый — «Владею тактикой и стратегией набегов»
    KHAN   = "khan",   "Хан"     # Профессионал — «Турнирный игрок, ведущий орду к победе»


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    # ── Прогрессия игрока ─────────────────────────────────────────────────────
    level = models.CharField(
        max_length=10,
        choices=PlayerLevel.choices,
        default=PlayerLevel.NOMAD,
    )
    xp = models.PositiveIntegerField(default=0)
    rating = models.PositiveIntegerField(default=800)

    # ── Внутренняя валюта «Асық» ──────────────────────────────────────────────
    asyqs = models.PositiveIntegerField(
        default=100,
        help_text="Баланс внутренней валюты «Асық»",
    )

    # ── Подписка ──────────────────────────────────────────────────────────────
    is_pro = models.BooleanField(
        default=False,
        help_text="Активна ли PRO-подписка «Focus Pass»",
    )
    pro_expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Дата истечения подписки",
    )

    # ── Локализация ───────────────────────────────────────────────────────────
    city = models.CharField(
        max_length=30,
        choices=KazakhCity.choices,
        default=KazakhCity.ALMATY,
        help_text="Город для городского лидерборда",
    )

    # ── Push-уведомления ──────────────────────────────────────────────────────
    push_notifications_enabled = models.BooleanField(
        default=False,
        help_text="Браузерные push-уведомления о ходах соперника",
    )
    push_subscription_json = models.JSONField(
        null=True,
        blank=True,
        help_text="Web Push subscription объект от браузера",
    )

    # ── Онбординг ─────────────────────────────────────────────────────────────
    onboarding_completed = models.BooleanField(default=False)

    # ── Статистика ────────────────────────────────────────────────────────────
    games_played          = models.PositiveIntegerField(default=0)
    games_won             = models.PositiveIntegerField(default=0)
    games_drawn           = models.PositiveIntegerField(default=0)
    total_focus_minutes   = models.PositiveIntegerField(default=0)

    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)

    # ── Ежедневный стрик ─────────────────────────────────────────────────────
    current_streak  = models.PositiveIntegerField(default=0)
    last_login_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "Профиль"
        verbose_name_plural = "Профили"

    def __str__(self) -> str:
        return f"{self.user.username} [{self.get_level_display()}] — {self.asyqs} асық"

    # ── Computed properties ───────────────────────────────────────────────────
    @property
    def games_lost(self) -> int:
        return self.games_played - self.games_won - self.games_drawn

    @property
    def win_rate(self) -> float:
        if self.games_played == 0:
            return 0.0
        return round(self.games_won / self.games_played * 100, 1)

    # ── Business logic ────────────────────────────────────────────────────────
    def award_asyqs(self, amount: int, reason: str = "") -> None:
        self.asyqs += amount
        self.save(update_fields=["asyqs"])
        AsyqTransaction.objects.create(profile=self, amount=amount, reason=reason)

    def level_up_check(self) -> bool:
        """Повышает уровень при достижении порогов XP. Возвращает True если уровень вырос."""
        thresholds = {
            PlayerLevel.NOMAD:  500,
            PlayerLevel.SARBAZ: 2000,
            PlayerLevel.BATYR:  6000,
        }
        threshold = thresholds.get(self.level)
        if threshold and self.xp >= threshold:
            levels = list(PlayerLevel)
            idx = levels.index(PlayerLevel(self.level))
            if idx + 1 < len(levels):
                self.level = levels[idx + 1]
                self.save(update_fields=["level"])
                return True
        return False


class FriendshipStatus(models.TextChoices):
    PENDING  = "pending",  "Ожидание"
    ACCEPTED = "accepted", "Принято"
    DECLINED = "declined", "Отклонено"


class Friendship(models.Model):
    """Запрос на дружбу / Вызов на партию."""
    sender         = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_friendships")
    receiver       = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_friendships")
    status         = models.CharField(max_length=10, choices=FriendshipStatus.choices, default=FriendshipStatus.PENDING)
    challenge_token = models.CharField(max_length=32, blank=True, help_text="Уникальный токен для ссылки-вызова")
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together     = [("sender", "receiver")]
        ordering            = ["-created_at"]
        verbose_name        = "Дружба"
        verbose_name_plural = "Дружбы"

    def __str__(self) -> str:
        return f"{self.sender.username} → {self.receiver.username} [{self.status}]"


class SubscriptionTier(models.TextChoices):
    NOMAD      = "nomad",      "Номад (Бесплатно)"
    SULTAN     = "sultan",     "Султан (Pro)"
    GREAT_KHAN = "great_khan", "Великий Хан (Ultimate)"


class SubscriptionStatus(models.TextChoices):
    ACTIVE    = "active",    "Активна"
    CANCELLED = "cancelled", "Отменена"
    EXPIRED   = "expired",   "Истекла"


class Subscription(models.Model):
    user        = models.OneToOneField(User, on_delete=models.CASCADE, related_name="subscription")
    tier        = models.CharField(max_length=12, choices=SubscriptionTier.choices, default=SubscriptionTier.NOMAD)
    status      = models.CharField(max_length=10, choices=SubscriptionStatus.choices, default=SubscriptionStatus.ACTIVE)
    started_at  = models.DateTimeField(auto_now_add=True)
    expires_at  = models.DateTimeField(null=True, blank=True)
    payment_ref = models.CharField(max_length=64, blank=True, help_text="ID транзакции Kaspi/Stripe")
    auto_renew  = models.BooleanField(default=True)

    PRICES = {
        SubscriptionTier.NOMAD:      0,
        SubscriptionTier.SULTAN:     1990,
        SubscriptionTier.GREAT_KHAN: 4990,
    }

    class Meta:
        verbose_name        = "Подписка"
        verbose_name_plural = "Подписки"

    def __str__(self) -> str:
        return f"{self.user.username} — {self.get_tier_display()} [{self.status}]"


class AsyqTransaction(models.Model):
    """Лог всех начислений/списаний внутренней валюты «Асық»."""
    profile    = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="asyq_transactions")
    amount     = models.IntegerField()
    reason     = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering            = ["-created_at"]
        verbose_name        = "Транзакция асыков"
        verbose_name_plural = "Транзакции асыков"

    def __str__(self) -> str:
        sign = "+" if self.amount >= 0 else ""
        return f"{sign}{self.amount} — {self.reason}"


# ── Автосоздание профиля при регистрации ──────────────────────────────────────
@receiver(post_save, sender=User)
def create_or_save_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    else:
        instance.profile.save()
