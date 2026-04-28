from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    discounted_price = serializers.SerializerMethodField()
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model  = Product
        fields = [
            "id", "name", "description", "category", "category_display",
            "price", "discounted_price", "image_url", "is_active", "coming_soon",
        ]

    def get_discounted_price(self, obj) -> int:
        request = self.context.get("request")
        is_pro  = False
        if request and request.user.is_authenticated:
            try:
                is_pro = request.user.profile.is_pro
            except Exception:
                pass
        return obj.discounted_price(is_pro)
