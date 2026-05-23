import anthropic
import json
from django.http import JsonResponse
from django.views import View
import httpx
from django.conf import settings
from openai import OpenAI
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render

class ChatbotView(View):
    
    def get(self, request, *args, **kwargs):
        return render(request, 'chat/index.html')
    
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        messages = data.get("messages", [])
        
        if not messages:
            return JsonResponse({"error": "پیام خالیه"}, status=400)
        
        client = OpenAI(base_url='https://api.gapgpt.app/v1', api_key=settings.ANTHROPIC_API_KEY)
        
        response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages
        )
        
        return JsonResponse({"reply": response.choices[0].message.content})