from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path("register/", views.RegisteView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogOutView.as_view(), name="logout"),

    # password reset urls
    path("password/reset/", views.CustomPasswordResetView.as_view(), name="password-reset"),
    path("password/reset/done/", views.CustomPasswordResetDoneView.as_view(), name="password-reset-done"),
]
