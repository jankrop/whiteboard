from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


class User(AbstractUser):
    pass


class Board(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=128)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    background = models.CharField(max_length=64, default='none')
    board_objects = models.JSONField()
