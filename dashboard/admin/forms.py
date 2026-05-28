from django import forms
from django.contrib.auth import forms as auth_form
from accounts.models import Profile


class AdminProfileEditForm(forms.ModelForm):

    class Meta:
        model = Profile
        fields = ["first_name", "last_name"]

class AdminChangePasswordForm(auth_form.PasswordChangeForm):

    error_messages = {
        "password_incorrect":
            "پسوورد قدیمی شما اشتباه است.",
        "password_mismatch":
            "پسوورد های جدید همخوانی ندارند",
    }