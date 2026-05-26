from django.shortcuts import render
from django.views.generic import FormView
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth import views as auth_view
from django.shortcuts import redirect
from django.urls import reverse_lazy
from .forms import RegisterForm, LoginForm

# Create your views here.


class RegisteView(FormView):
    template_name = "accounts/register.html"
    form_class = RegisterForm
    success_url = reverse_lazy("chat:chat_bot")

    def form_valid(self, form):
        user = form.save()
        login(self.request, user)
        messages.success(self.request, "اکانت با موفقیت ایجاد شد")
        return super().form_valid(form)
    
    def form_invalid(self, form):
        for field, errors in form.errors.items():
            for error in errors:
                messages.error(self.request, f"{error}")
        return super().form_invalid(form) 


class LoginView(auth_view.LoginView):
    template_name = "accounts/login.html"
    form_class = LoginForm

class LogOutView(auth_view.LogoutView):
    pass

class CustomPasswordResetView(auth_view.PasswordResetView):
    template_name = "accounts/password_reset.html"

class CustomPasswordResetDoneView(auth_view.PasswordResetDoneView):
    template_name = "accounts/password_reset_done.html"