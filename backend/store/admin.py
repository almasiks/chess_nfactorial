from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = ("name", "category", "price", "is_active", "coming_soon", "created_at")
    list_filter   = ("category", "is_active", "coming_soon")
    search_fields = ("name",)
    list_editable = ("price", "is_active", "coming_soon")
