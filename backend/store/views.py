from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def product_list_view(request):
    """GET /api/store/products/?category=chess|clothes|accessories"""
    category = request.query_params.get("category")
    qs = Product.objects.filter(is_active=True)
    if category:
        qs = qs.filter(category=category)
    return Response(ProductSerializer(qs, many=True, context={"request": request}).data)
