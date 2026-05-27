from django.shortcuts import redirect
from django.views.generic import View, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from accounts.models import UserType
from dashboard.permissions import HasAdminPermission

# Create your views here.

class AdminProfileview(LoginRequiredMixin, HasAdminPermission, TemplateView):
    template_name = "dashboard/admin/profile/profile.html"
    
