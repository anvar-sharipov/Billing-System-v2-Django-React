from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator
from django.db import models

def user_image_path(instance, filename):
    return f'users/{instance.username}/{filename}'

class User(AbstractUser):
    # убираем стандартный валидатор, разрешаем пробелы
    username = models.CharField(
        max_length=150,
        unique=True,
        validators=[MinLengthValidator(1)],  # минимум 1 символ
        help_text='Required. 150 characters or fewer. Spaces allowed.',
    )
    image = models.ImageField(upload_to=user_image_path, blank=True, null=True)

    def __str__(self):
        return self.username
