from django.contrib import admin
from .models import Profile, AsyqTransaction


class AsyqTransactionInline(admin.TabularInline):
    model           = AsyqTransaction
    extra           = 0
    fields          = ["amount", "reason", "created_at"]
    readonly_fields = ["created_at"]


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display    = ["user", "level", "rating", "asyqs", "is_pro", "city", "games_played", "win_rate"]
    list_filter     = ["level", "is_pro", "city", "push_notifications_enabled"]
    search_fields   = ["user__username", "user__email"]
    readonly_fields = ["created_at", "updated_at", "games_lost", "win_rate"]
    inlines         = [AsyqTransactionInline]


@admin.register(AsyqTransaction)
class AsyqTransactionAdmin(admin.ModelAdmin):
    list_display  = ["profile", "amount", "reason", "created_at"]
    list_filter   = ["created_at"]
    search_fields = ["profile__user__username", "reason"]
