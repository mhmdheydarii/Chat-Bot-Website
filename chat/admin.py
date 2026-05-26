from django.contrib import admin
from .models import ConversationModel, MessageModel

# Register your models here.
@admin.register(ConversationModel)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "title", "created_at", "updated_at"]
    search_fields = ["user"]

@admin.register(MessageModel)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["id", "conversation", "created_at"]
    search_fields = ["conversation"]
