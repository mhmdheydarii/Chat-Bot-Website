from django.urls import path, include
from . import views

app_name = "admin"

urlpatterns = [
    path("profile/", views.AdminProfileview.as_view(), name="profile"),
]
