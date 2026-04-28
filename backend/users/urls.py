from django.urls import path
from . import views

urlpatterns = [
    path("login/",             views.login_view,                 name="login"),
    path("register/",          views.RegisterView.as_view(),     name="register"),
    path("me/",                views.profile_view,               name="profile"),
    path("onboarding/",        views.onboarding_view,            name="onboarding"),
    path("push-subscription/", views.push_subscription_view,     name="push-subscription"),
    path("leaderboard/",       views.leaderboard_view,           name="leaderboard"),
    # Player search
    path("search/",            views.player_search_view,         name="player-search"),
    # Friendships / Challenges
    path("friends/",           views.friendship_list_view,       name="friendship-list"),
    path("friends/pending/",   views.pending_challenges_view,    name="friendship-pending"),
    path("friends/<int:pk>/respond/", views.friendship_respond_view, name="friendship-respond"),
    # Subscription
    path("subscription/",      views.subscription_view,          name="subscription"),
]
