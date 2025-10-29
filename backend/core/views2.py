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
        
        

@api_view(['GET'])
def get_filtered_users(request):
    searchType = request.GET.get('searchType', '')
    surname = request.GET.get('surname', '')
    name = request.GET.get('name', '')
    patronymic = request.GET.get('patronymic', '')
    is_enterprises = request.GET.get('is_enterprises', '')
    is_active = request.GET.get('is_active', '')
    etrap_id = request.GET.get('etrap', '')
    account = request.GET.get('account', '')
    hb_type = request.GET.get('hb_type', '')
    phone = request.GET.get('phone', '')
    dogowor = request.GET.get('dogowor', '')
    
    # UserTable.objects.all().delete()
    # UserDogowor.objects.all().delete()

    qs = UserTable.objects.all()

    # Фильтруем по is_active
    if is_active:
        qs = qs.filter(is_active=(is_active == 'true'))

    # Фильтруем по предприятию
    if is_enterprises:
        qs = qs.filter(is_enterprises=(is_enterprises == 'true'))

    # Фильтр по этрапу
    if etrap_id:
        qs = qs.filter(etrap__id=etrap_id)

    # Фильтры для searchType
    if searchType == 'users':
        if surname:
            qs = qs.filter(surname__icontains=surname)
        if name:
            qs = qs.filter(name__icontains=name)
        if patronymic:
            qs = qs.filter(patronymic__icontains=patronymic)
        if phone:
            qs = qs.filter(mobile_number__icontains=phone)
        if dogowor:
            # Поиск по связанным договорам
            qs = qs.filter(dogowors__dogowor__icontains=dogowor)
    elif searchType == 'phone':
        if phone:
            qs = qs.filter(mobile_number__icontains=phone)
    elif searchType == 'dogowor':
        if dogowor:
            qs = qs.filter(dogowors__dogowor__icontains=dogowor)

    # Фильтры для предприятий
    if account:
        qs = qs.filter(account=account)
    if hb_type:
        qs = qs.filter(hb_type=hb_type)

    # Сериализация
    results = []
    for user in qs.distinct():
        dogowors_list = []
        for d in user.dogowors.all():
            dogowors_list.append({
                "dogowor": d.dogowor,
                "balance": d.balance.amount if hasattr(d, "balance") else 0,
                "login": d.login.login if hasattr(d, "login") else None,
                "balance_type": d.get_balance_type_display(),
                "activate_at": d.activate_at,
                "deactivate_at": d.deactivate_at,
            })

        results.append({
            "id": user.id,
            "number": user.number,
            "surname": user.surname,
            "name": user.name,
            "patronymic": user.patronymic,
            "phone": user.mobile_number,
            "is_active": user.is_active,
            "is_enterprises": user.is_enterprises,
            "account": user.account,
            "hb_type": user.hb_type,
            "etrap": str(user.etrap),
            "address": user.address,
            "dogowors": dogowors_list,
        })
    
    ic(results)

    return JsonResponse({"results": results})

