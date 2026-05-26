from django import forms
from django.core.exceptions import ValidationError
from django.contrib.auth import forms as auth_form

from .models import User


class RegisterForm(forms.ModelForm):
    password1 = forms.CharField(max_length=50, required=True)
    password2 = forms.CharField(max_length=50, required=True)

    class Meta:
        model = User
        fields = ["username", "email", "password1", "password2"]


    def clean_username(self, *args, **kwargs):
        username = self.cleaned_data.get("username")

        if User.objects.filter(username=username).exists():
            raise ValidationError("یوزرنیم درحال حاضر وجود دارد.")
        return username

    def clean_email(self, *args, **kwargs):
        email = self.cleaned_data.get("email")

        if User.objects.filter(email=email).exists():
            raise ValidationError("ایمیل درحال حاضر وجود دارد.")
        return email


    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")
        
        if password1 and password2 and password1 != password2:
            self.add_error("password2" ,"رمز عبور و تکرار آن یکسان نیستند")
        return cleaned_data
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user
    
    
class LoginForm(auth_form.AuthenticationForm):
    email = forms.EmailField(required=True)
    
    error_messages = {
        "invalid_login": 
            "لطفا یوزرنیم و پسوورد خود را به درستی وارد کنید"
        ,
        "inactive":"اکانت کاربری امکان دسترسی ندارد",
    }
