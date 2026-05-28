from django.urls import path, include
from . import views

app_name = "admin"

urlpatterns = [
    path("profile/", views.AdminProfileview.as_view(), name="profile"),
    path("profile/edit/", views.AdminProfileEditView.as_view(), name="profile-edit"),
    path("change/password/", views.AdminChangePasswordView.as_view(), name="change-password"),
]
