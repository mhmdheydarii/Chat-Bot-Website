import anthropic
import json
from django.http import JsonResponse
from django.views import View
import httpx
from django.conf import settings
from openai import OpenAI, OpenAIError
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, get_object_or_404
from django.urls import reverse_lazy
from .models import ConversationModel, MessageModel
import logging

logger = logging.getLogger(__name__)

class ChatPageView(LoginRequiredMixin, View):
    login_url = reverse_lazy("accounts:login")

    def get(self, request):
        return render(request, "chat/index.html")
    

class ConversationListView(LoginRequiredMixin, View):

    def get(self, request):
        conversations = request.user.conversation.values(
            "id", 'title', "updated_at"
        )
        return JsonResponse({"conversations":list(conversations)})


class ConversationCreateView(LoginRequiredMixin, View):

    def post(self, request):
        conversation = ConversationModel.objects.create(user=request.user)

        return JsonResponse({
            "id": conversation.id,
            "title": conversation.title
        })


class ConversationDeleteView(LoginRequiredMixin, View):

    def delete(self, request, pk):
        conversation = get_object_or_404(ConversationModel, id=pk, user=request.user)
        conversation.delete()
        return JsonResponse({"delete": True})



class ChatbotView(LoginRequiredMixin, View):
    
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error":"درخواست نامعتبر"}, status=400)
        message_text = data.get("message", "").strip()
        conversation_id = data.get("conversation_id")
        
        if not message_text:
            return JsonResponse({"error": "پیام خالیه"}, status=400)
        
        if conversation_id:
            conversation = get_object_or_404(ConversationModel, id=conversation_id, user=request.user)
        else:
            conversation = ConversationModel.objects.create(user=request.user)
        
        if not conversation.message.exists():
            conversation.title = message_text[:50]
            conversation.save()

        MessageModel.objects.create(
            conversation = conversation,
            content = message_text,
            role = MessageModel.Role.User
        )
        
        history = conversation.message.values("role", "content")

        try:
            reply = self._get_ai_reply(history)
        except OpenAIError as e:
            logger.error(f"OpenAi error : {e}")
            return JsonResponse({"error" : "خطا در ارتباط با سرویس"}, status=502)
        
        MessageModel.objects.create(
            conversation = conversation,
            content = reply,
            role = MessageModel.Role.ASSISTANT,
        )
        return JsonResponse({
            'reply':           reply,
            'conversation_id': conversation.id,
            'title':           conversation.title,
        })

        conversation.save()

    def _get_ai_reply(self ,history):
        client = OpenAI(
            base_url='https://api.avalai.ir/v1', 
            api_key=settings.API_KEY, 
            timeout=10.0
            )
        
        response = client.chat.completions.create(
            model="gpt-5-chat",
            messages=history,
            max_tokens=1024
        )
        
        return response.choices[0].message.content
    

class ConversationMessagesView(LoginRequiredMixin, View):
    """Returns all messages for one conversation — called when user clicks history item"""
    def get(self, request, pk):
        conversation = get_object_or_404(ConversationModel, id=pk, user=request.user)
        messages = conversation.message.values('role', 'content', 'created_at')
        return JsonResponse({'messages': list(messages)})