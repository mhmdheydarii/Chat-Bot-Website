from django.shortcuts import redirect
from django.views.generic import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from accounts.models import UserType

# Create your views here.

class UserTypeView(LoginRequiredMixin, View):
    
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            if request.user.type == UserType.user.value:
                return redirect(reverse_lazy("dashboard:user:profile"))
            if request.user.type == UserType.admin.value:
                return redirect(reverse_lazy("dashboard:admin:profile"))
        else:
            return redirect(reverse_lazy("account:login"))
        return super().dispatch(request, *args, **kwargs)
