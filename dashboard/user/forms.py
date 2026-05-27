from django import forms
from django.contrib.auth import forms as auth_form
from accounts.models import Profile

class UserProfileWeditForm(forms.ModelForm):

    class Meta:
        model = Profile
        fields = ["first_name", "last_name"]


class UserChangePasswordForm(auth_form.PasswordChangeForm):

    error_messages = {
        "password_incorrect":
            "پسوورد قدیمی شما اشتباه است.",
        "password_mismatch":
            "پسوورد های جدید همخوانی ندارند"
    }


