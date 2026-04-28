from django.urls import path
from . import views

urlpatterns = [
    path("daily/",         views.daily_puzzle_view, name="puzzle-daily"),
    path("<int:pk>/solve/", views.solve_puzzle_view, name="puzzle-solve"),
]
