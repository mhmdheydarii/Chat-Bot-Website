from django.shortcuts import redirect
from django.views.generic import View, TemplateView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.contrib.messages.views import SuccessMessageMixin
from django.contrib.auth import views as auth_view
from accounts.models import Profile
from dashboard.permissions import HasUserPermission
from .forms import UserProfileWeditForm, UserChangePasswordForm
# Create your views here.

class UserProfileView(LoginRequiredMixin, HasUserPermission, TemplateView):
    template_name = "dashboard/user/profile/profile.html"


class UserProfileEditView(LoginRequiredMixin, HasUserPermission, SuccessMessageMixin, UpdateView):

    template_name = "dashboard/user/profile/edit-profile.html"
    form_class = UserProfileWeditForm
    success_url = reverse_lazy("dashboard:user:profile")
    success_message = "اطلاعات شما بروزرسانی شد"
    
    def get_object(self, queryset=None):
        return Profile.objects.get(user=self.request.user)


class UserChangePasswordView(LoginRequiredMixin, HasUserPermission, SuccessMessageMixin, auth_view.PasswordChangeView):

    template_name = "dashboard/user/profile/change-password.html"
    form_class = UserChangePasswordForm
    success_url = reverse_lazy("dashboard:user:profile")
    success_message = "پسوورد شما بروزرسانی شد"