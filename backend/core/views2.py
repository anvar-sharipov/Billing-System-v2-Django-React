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
from django.core.paginator import Paginator, EmptyPage
from django.shortcuts import get_object_or_404
from .serializers import UserTableSerializer, UserDogoworSerializer
from django.utils.timezone import make_aware
from .views import get_group_list



@api_view(['GET'])
def checkActiveOrNot(request):
    try:
        # Получаем параметры из query string
        number = request.GET.get('number')
        etrap = request.GET.get('etrap')
        
        activate_at = request.GET.get('activate_at')
        deactivate_at = request.GET.get('deactivate_at')
        
        activate_at_datetime = None
        if activate_at:
            activate_at_datetime = datetime.fromisoformat(activate_at)
         
        deactivate_at_datetime = None
        if deactivate_at:
            deactivate_at_datetime = datetime.fromisoformat(deactivate_at)
            
        
        ic(activate_at_datetime)
        ic(deactivate_at_datetime)
        
        
        user_id = request.GET.get('id')

        ic("Received parameters:", number, etrap)
        
        # Валидация обязательных параметров
        if not number:
            return Response({
                "success": False,
            }, status=400)
        
        if not etrap:
            return Response({
                "success": False, 
            }, status=400)
        
   
        
        if activate_at_datetime and not deactivate_at_datetime: 
            # Ищем пользователей с таким номером и этапом, у которых есть активные договоры
            query = UserTable.objects.filter(
                number=number,
                etrap_id=etrap,
                dogowors__activate_at__isnull=False,
                dogowors__deactivate_at__isnull=True,
                dogowors__balance_type="telefon"
            )

            # Исключаем текущего пользователя при редактировании
            if user_id:
                query = query.exclude(id=user_id)

            abonent_exists = query.exists()

            return Response({
                "success": True,
                "exists": abonent_exists,
                "message": "Check completed successfully"
            })
        else:
            return Response({
                "success": False, 
            }, status=400)
        
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
        dogowor_id = request.GET.get('id')
        
        
        # Валидация обязательных параметров
        if not dogowor:
            return Response({
                "success": False,
                "error": "Dogowor parameter is required"
            }, status=400)
            
            
        qs = UserDogowor.objects.filter(dogowor=dogowor, balance_type=dogowor_type)
        
        if dogowor_id:
            qs = qs.exclude(id=dogowor_id)

        dogowor_exists = qs.exists()
        
        
        # dogowor_exists = UserDogowor.objects.filter(dogowor=dogowor, balance_type=dogowor_type).exists()
        # ic(dogowor_exists)
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
    # Получаем параметры фильтрации
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
    address = request.GET.get('address', '')
    # abonplata = request.GET.get('abonplata', '')
    # services = request.GET.get('services', '')
    
    ic(is_active)
    
    # UserTable.objects.all().delete()
    # UserDogowor.objects.all().delete()
    
    # Параметры пагинации
    page = request.GET.get('page', 1)
    page_size = request.GET.get('page_size', 10)  # По умолчанию 20 записей на странице
    
    try:
        page = int(page)
        page_size = int(page_size)
    except (ValueError, TypeError):
        page = 1
        page_size = 20

    qs = UserTable.objects.all()

    # Фильтруем по is_active
    if is_active == 'true':
        # Активные
        ic("tut")
        qs = qs.filter(
            dogowors__activate_at__isnull=False,
            dogowors__deactivate_at__isnull=True,
            dogowors__balance_type="telefon"
        ).distinct()
        ic(qs)
    elif is_active == 'false':
        # Неактивные (имеют отключенные телефонные договоры)
        qs = qs.filter(
            dogowors__deactivate_at__isnull=False,
            dogowors__balance_type="telefon"
        ).distinct()

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
            qs = qs.filter(
                Q(number__icontains=phone) |
                Q(mobile_number__icontains=phone)
            )
        if dogowor:
            qs = qs.filter(dogowors__dogowor__icontains=dogowor)
    elif searchType == 'phone':
        if phone:
            qs = qs.filter(
                Q(number__icontains=phone) |
                Q(mobile_number__icontains=phone)
            )
    elif searchType == 'dogowor':
        if dogowor:
            qs = qs.filter(dogowors__dogowor__icontains=dogowor)
    elif searchType == 'address':
        if address:
            qs = qs.filter(address__icontains=address)

    # Фильтры для предприятий
    if account:
        qs = qs.filter(account=account)
    if hb_type:
        qs = qs.filter(hb_type=hb_type)

    # Применяем distinct() и подсчитываем общее количество записей
    qs = qs.distinct()
    total_count = qs.count()

    # Создаем пагинатор
    paginator = Paginator(qs, page_size)
    
    try:
        paginated_qs = paginator.page(page)
    except EmptyPage:
        # Если страница пустая, возвращаем последнюю страницу
        paginated_qs = paginator.page(paginator.num_pages)

    # Сериализация
    results = []
    for user in paginated_qs:
        dogowors_list = []
        for d in user.dogowors.all():
            dogowors_list.append({
                "id": d.id,
                "dogowor": d.dogowor,
                "balance": d.balance.amount if hasattr(d, "balance") else 0,
                "login": d.login,
                "balance_type": d.get_balance_type_display(),
                "balance_type2": d.balance_type,
                "comment": d.comment,
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
            # "is_active": user.is_active,
            "is_enterprises": user.is_enterprises,
            "account": user.account,
            "hb_type": user.hb_type,
            "etrap": str(user.etrap),
            "address": user.address,
            "abonplata": user.abonplata,
            "dogowors": dogowors_list,
        })

    # Возвращаем ответ с пагинацией
    return JsonResponse({
        "results": results,
        "pagination": {
            "current_page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_pages": paginator.num_pages,
            "has_next": paginated_qs.has_next(),
            "has_previous": paginated_qs.has_previous(),
        }
    })



@api_view(['GET'])
def get_user_for_update_telefoniya(request):
    
    dogoworId = request.GET.get("dogoworId")
    
    dogowor_obj = get_object_or_404(UserDogowor, id=dogoworId)
    user = dogowor_obj.user

    # user_services = UserService.objects.filter(user=user)
    # for s in user_services:
    #     ic(s.connected_by.username)
    
    # ⭐⭐⭐ ПОЛУЧАЕМ ПОДРОБНЫЕ ДАННЫЕ ОБ УСЛУГАХ ⭐⭐⭐
    user_services = UserService.objects.filter(user=user, is_active=True).select_related('service')
    services_data = []
    services_ids = []
    service_dates = {}  # ← ДОБАВИТЬ ЭТО!

    for user_service in user_services:
        services_ids.append(user_service.service_id)
        services_data.append({
            "id": user_service.service_id,
            "service": user_service.service.service,
            "price": user_service.service.price,
            "actual_price": user_service.actual_price,
            "date_connected": user_service.date_connected,
            "is_active": user_service.is_active,
        })
        
        # ⭐⭐⭐ ДОБАВЛЯЕМ ДАННЫЕ В service_dates ⭐⭐⭐
        service_dates[str(user_service.service_id)] = {
            "activate_at": user_service.date_connected,  # дата подключения
            "deactivate_at": user_service.date_end if user_service.date_end else None,  # ← ИСПРАВЛЕНО: date_end вместо date_disconnected
            "comment": user_service.comment
        }

    # ⭐⭐⭐ ФОРМИРУЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ ⭐⭐⭐
    user_data = {
        "id": user.id,
        "number": user.number,
        "name": user.name,
        "surname": user.surname,
        "patronymic": user.patronymic,
        "address": user.address,
        "mobile_number": user.mobile_number,
        "is_enterprises": user.is_enterprises,
        "account": user.account,
        "hb_type": user.hb_type,
        "etrap": user.etrap.id if user.etrap else None,
        "abonplata": str(user.abonplata),
        "services": services_ids,
        "services_details": services_data,
        "service_dates": service_dates,  # ← ДОБАВИТЬ ЭТО В ОТВЕТ!
        
    }
    
    # ⭐⭐⭐ ФОРМИРУЕМ ДАННЫЕ ДОГОВОРА ⭐⭐⭐
    dogowor_data = {
        "id": dogowor_obj.id,
        "dogowor": dogowor_obj.dogowor,
        "balance_type": dogowor_obj.balance_type,
        "activate_at": dogowor_obj.activate_at,
        "deactivate_at": dogowor_obj.deactivate_at,
        "comment": dogowor_obj.comment,
        "already_deactivated": True if dogowor_obj.deactivate_at else False
    }
    
    ic(dogowor_data)
    
    return Response({
        "success": True,
        "user": user_data,
        "dogowor": dogowor_data,
    })
    

@api_view(['GET'])
def get_all_services(request):
    
    services = Service.objects.filter(is_active=True)
    
    data = []
    
    for service in services:
        data.append({
            "id":service.id,
            "service":service.service,
            "price":service.price,
        })
    
    
    return Response({
        "success": True,
        "data": data,
    })
    
    
    