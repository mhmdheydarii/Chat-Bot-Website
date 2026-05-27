from django.urls import path, include
from . import views

urlpatterns = [
    path("home", views.UserTypeView.as_view(), name="user-type"),

    path("user/", include("dashboard.user.urls"))
]