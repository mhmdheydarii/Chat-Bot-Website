from django.urls import path, include
from . import views

app_name = "user"

urlpatterns = [
    path("profile/", views.UserProfileView.as_view(), name="profile"),
    path("profile/edit/", views.UserProfileEditView.as_view(), name="profile-edit"),
    path("change/password/", views.UserChangePasswordView.as_view(), name="change-password"),
]