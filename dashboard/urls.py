from django.urls import path, include
from . import views

app_name = "dashboard"

urlpatterns = [
    path("home/", views.UserTypeView.as_view(), name="home"),
    path("user/", include("dashboard.user.urls")),
    # path("admin/", include("dashboard.admin.urls")),
]
