from django.urls import path
from . import views

app_name = "chat"

urlpatterns = [
    path('', views.ChatbotView.as_view(), name="chat_bot")
]
