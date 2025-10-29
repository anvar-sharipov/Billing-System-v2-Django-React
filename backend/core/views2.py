# core/views.py
import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.storage import default_storage
import os
import uuid
from datetime import datetime
from icecream import ic

from rest_framework import viewsets
from .models import Etrap
from .serializers import EtrapSerializer

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.exceptions import ValidationError
import re
from .models import *



@api_view(['GET'])
def checkActiveOrNot(request):
    try:
        # Получаем параметры из query string
        number = request.GET.get('number')
        etrap = request.GET.get('etrap')
        is_active = request.GET.get('is_active')

        ic("Received parameters:", number, etrap, is_active)
        
        # Валидация обязательных параметров
        if not number:
            return Response({
                "success": False,
                "error": "Number parameter is required"
            }, status=400)
        
        if not etrap:
            return Response({
                "success": False, 
                "error": "Etrap parameter is required"
            }, status=400)
        
        # Преобразование is_active в boolean
        is_active_bool = is_active and is_active.lower() in ['true', '1', 'yes']
        
        # Здесь ваша бизнес-логика проверки
        # Например:
        # from .models import Abonent
        # abonent_exists = Abonent.objects.filter(
        #     number=number,
        #     etrap_id=etrap,
        #     is_active=is_active_bool
        # ).exists()
        
        # Заглушка для примера
        abonent_exists = UserTable.objects.filter(number=number, etrap_id=etrap, is_active=is_active_bool).exists()
        
        return Response({
            "success": True,
            "exists": abonent_exists,
            "message": "Check completed successfully"
        })
        
    except Exception as e:
        ic("Error in checkActiveOrNot:", str(e))
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)
        
        
        

@api_view(['GET'])
def checkUniqueDogowor(request):
    ic("checkUniqueDogowor")
    try:
        # Получаем параметры из query string
        dogowor = request.GET.get('dogowor')
        dogowor_type = request.GET.get('dogowor_type')
        
        
        # Валидация обязательных параметров
        if not dogowor:
            return Response({
                "success": False,
                "error": "Dogowor parameter is required"
            }, status=400)
        
        
        dogowor_exists = UserDogowor.objects.filter(dogowor=dogowor, balance_type=dogowor_type).exists()
        ic(dogowor_exists)
        return Response({
            "success": True,
            "exists": dogowor_exists,
            "message": "Check completed successfully"
        })
        
    except Exception as e:
        ic("Error in checkUniqueDogowor:", str(e))
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)