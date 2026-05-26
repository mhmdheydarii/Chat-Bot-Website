from django.db import models
from accounts.models import User
# Create your models here.

class ConversationModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="conversation")
    title = models.CharField(max_length=255, default="گفتگوی جدید")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ' ' {self.user.username}"
    
    class Meta:
        ordering = ["-updated_at"]


class MessageModel(models.Model):
    class Role(models.TextChoices):
        User = "user", "User"
        ASSISTANT = 'assistant', 'Assistant'
    conversation = models.ForeignKey(ConversationModel, on_delete=models.CASCADE, related_name="message")
    content = models.TextField()
    role = models.CharField(max_length=10, choices=Role.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role} ' ' {self.content[:50]}"