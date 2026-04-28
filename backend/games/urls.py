from django.urls import path
from . import views

urlpatterns = [
    path("", views.GameListCreateView.as_view(), name="game-list"),
    path("<int:pk>/",  views.GameDetailView.as_view(),     name="game-detail"),
    path("<int:game_id>/move/", views.make_move_view,      name="make-move"),
]
