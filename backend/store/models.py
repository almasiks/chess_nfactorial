from django.db import models


class ProductCategory(models.TextChoices):
    CHESS   = "chess",   "Шахматы"
    CLOTHES = "clothes", "Одежда"
    ACCESSORIES = "accessories", "Аксессуары"


class Product(models.Model):
    name        = models.CharField(max_length=128)
    description = models.TextField(blank=True)
    category    = models.CharField(max_length=16, choices=ProductCategory.choices, default=ProductCategory.CHESS)
    price       = models.PositiveIntegerField(help_text="Цена в тенге")
    image_url   = models.URLField(blank=True, help_text="URL изображения (заглушка или CDN)")
    is_active   = models.BooleanField(default=True)
    coming_soon = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering            = ["category", "price"]
        verbose_name        = "Товар"
        verbose_name_plural = "Товары"

    def __str__(self) -> str:
        return f"{self.name} — {self.price}₸"

    def discounted_price(self, is_pro: bool = False) -> int:
        if is_pro:
            return round(self.price * 0.95)
        return self.price
