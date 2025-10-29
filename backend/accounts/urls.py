from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import *

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path("user/", current_user, name="current_user"),
    path('groups/', list_groups, name='groups'),
    path('users/', get_users, name='accounts_users'),
    path("me/", MeView.as_view(), name="me"),
]
