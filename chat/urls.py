from django.urls import path
from . import views

app_name = "chat"

urlpatterns = [
    path('', views.ChatPageView.as_view(), name="chat_bot"),
    path('send/', views.ChatbotView.as_view(), name="chat-send"),
    path('conversations/', views.ConversationListView.as_view(), name="converstaion-list"),
    path('conversation/new/', views.ConversationCreateView.as_view(), name="conversation-new"),
    path('conversation/<int:pk>/delete/', views.ConversationDeleteView.as_view(), name="conversation-delete"),
    path('conversation/<int:pk>/messages/', views.ConversationMessagesView.as_view(), name="conversation-messages"),
]
