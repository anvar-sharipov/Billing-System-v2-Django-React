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
from .models import *
from .serializers import EtrapSerializer

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.exceptions import ValidationError
import re
from datetime import datetime
from django.db import transaction
from django.shortcuts import get_object_or_404
from decimal import InvalidOperation
from .my_func import get_client_ip
import json
from .my_func import to_decimal_2
from .my_func import format_datetime_ru



def get_group_list(request):
        authenticated_user = request.user
        if authenticated_user:
            return list(authenticated_user.groups.values_list('name', flat=True))
        else:
            return []
        
def check_is_admin(request):
        authenticated_user = request.user
        if authenticated_user:
            return "admin" in list(authenticated_user.groups.values_list('name', flat=True))
        return False


class EtrapViewSet(viewsets.ModelViewSet):
    queryset = Etrap.objects.all()
    serializer_class = EtrapSerializer


@csrf_exempt
@require_http_methods(["POST"])
def upload_users_from_excel(request):
    ic("tut")
    """
    Обработчик для загрузки Excel файла с пользователями
    """
    try:
        # Проверяем наличие файла в запросе
        if 'excel_file' not in request.FILES:
            return JsonResponse({
                'success': False,
                'message': 'Файл не найден в запросе'
            }, status=400)

        excel_file = request.FILES['excel_file']
        
        # Проверяем расширение файла
        allowed_extensions = ['.xls', '.xlsx']
        file_extension = os.path.splitext(excel_file.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            return JsonResponse({
                'success': False,
                'message': 'Неверный формат файла. Разрешены только .xls и .xlsx'
            }, status=400)

        # Сохраняем файл временно
        temp_filename = f"temp_{uuid.uuid4()}{file_extension}"
        temp_path = default_storage.save(temp_filename, excel_file)
        full_path = default_storage.path(temp_path) 
        
        try:
            # Читаем Excel файл
            if file_extension == '.xlsx':
                df = pd.read_excel(full_path, engine='openpyxl')
            else:
                df = pd.read_excel(full_path, engine='xlrd')
            
            # Проверяем что файл не пустой
            if df.empty:
                return JsonResponse({
                    'success': False,
                    'message': 'Файл пустой или не содержит данных'
                }, status=400)
            
            
            # ic(list(df.columns))
            
            # Проверяем обязательные колонки
            required_columns = ['ID',
                       'Пользователь',
                       'Логин',
                       'Мобильный телефон',
                       'Телефон',
                       'Email',
                       'Тип',
                       'Категория',
                       'Адрес прописки / Юридический адрес',
                       'Адрес проживания / Фактический адрес',
                       'Персональный менеджер',
                       'Комментарий']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                return JsonResponse({
                    'success': False,
                    'message': f'Отсутствуют обязательные колонки: {", ".join(missing_columns)}'
                }, status=400)
            
            # Обрабатываем данные
            processed_users = []
            errors = []
            
            for index, row in df.iterrows():
       
                
                try:
                    # user_data = {
                    #     'number': str(row['Номер']).strip(),
                    #     'name': str(row['Имя']).strip(),
                    #     'surname': str(row['Фамилия']).strip(),
                    #     'patronymic': str(row['Отчество']).strip() if 'Отчество' in df.columns and pd.notna(row['Отчество']) else '',
                    #     'street': str(row['Улица']).strip() if 'Улица' in df.columns and pd.notna(row['Улица']) else '',
                    #     'home': str(row['Дом']).strip() if 'Дом' in df.columns and pd.notna(row['Дом']) else '',
                    #     'kvartira': str(row['Квартира']).strip() if 'Квартира' in df.columns and pd.notna(row['Квартира']) else '',
                    #     'hb_type': str(row['Тип HB']).strip() if 'Тип HB' in df.columns and pd.notna(row['Тип HB']) else '',
                    #     'account': str(row['Счет']).strip() if 'Счет' in df.columns and pd.notna(row['Счет']) else '',
                    #     'is_enterprises': bool(row['Предприятие']) if 'Предприятие' in df.columns and pd.notna(row['Предприятие']) else False,
                    #     'is_active': bool(row['Активный']) if 'Активный' in df.columns and pd.notna(row['Активный']) else True,
                    # }
                    
                    user_data = {
                        'ID': str(row['ID']).strip(),
                        'name': str(row['Пользователь']).strip(),
                        'login': str(row['Логин']).strip() if 'Логин' in df.columns and pd.notna(row['Логин']) else '',
                        'mobile': str(row['Мобильный телефон']).strip() if 'Мобильный телефон' in df.columns and pd.notna(row['Мобильный телефон']) else '',
                        'phone': str(row['Телефон']).strip() if 'Телефон' in df.columns and pd.notna(row['Телефон']) else '',
                        'email': str(row['Email']).strip() if 'Email' in df.columns and pd.notna(row['Email']) else '',
                        'type': str(row['Тип']).strip() if 'Тип' in df.columns and pd.notna(row['Тип']) else '',
                        'category': str(row['Категория']).strip() if 'Категория' in df.columns and pd.notna(row['Категория']) else '',
                        'address_registered': str(row['Адрес прописки / Юридический адрес']).strip() if 'Адрес прописки / Юридический адрес' in df.columns and pd.notna(row['Адрес прописки / Юридический адрес']) else '',
                        'address_actual': str(row['Адрес проживания / Фактический адрес']).strip() if 'Адрес проживания / Фактический адрес' in df.columns and pd.notna(row['Адрес проживания / Фактический адрес']) else '',
                        'manager': str(row['Персональный менеджер']).strip() if 'Персональный менеджер' in df.columns and pd.notna(row['Персональный менеджер']) else '',
                        'comment': str(row['Комментарий']).strip() if 'Комментарий' in df.columns and pd.notna(row['Комментарий']) else '',
                    }
                    
                    
                    # Валидация данных
                    if not user_data['phone']:
                        errors.append(f"Строка {index + 2}: Отсутствует номер")
                        continue
                    
                    if not user_data['name']:
                        errors.append(f"Строка {index + 2}: Отсутствует имя")
                        continue
                    
                    if not user_data['login']:
                        errors.append(f"Строка {index + 2}: Отсутствует login")
                        continue
                    
                    processed_users.append(user_data)
                    
                except Exception as e:
                    errors.append(f"Строка {index + 2}: Ошибка обработки - {str(e)}")
                    continue
            
            # ic(user_data)
            # Если есть ошибки, возвращаем их
            # ic(errors)
            if errors:
                return JsonResponse({
                    'success': False,
                    'message': 'Обнаружены ошибки в данных',
                    'errors': errors[:10],  # Ограничиваем количество ошибок для ответа
                    'total_errors': len(errors)
                }, status=400)
            
            # Здесь должна быть логика сохранения пользователей в базу
            # saved_users = save_users_to_database(processed_users)
            
            return JsonResponse({
                'success': True,
                'message': f'Успешно обработано {len(processed_users)} пользователей',
                'processed_count': len(processed_users),
                # 'saved_count': saved_users,
                'saved_count': 100,
                'file_info': {
                    'filename': excel_file.name,
                    'size': excel_file.size,
                    'uploaded_at': datetime.now().isoformat()
                }
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Ошибка при чтении файла: {str(e)}'
            }, status=500)
            
        finally:
            # Удаляем временный файл
            if default_storage.exists(temp_path):
                default_storage.delete(temp_path)
                
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Неожиданная ошибка: {str(e)}'
        }, status=500)


 
@api_view(['POST'])
def save_abonent(request):
    ic("save_abonent")
    
    def get_group_list(request):
        authenticated_user = request.user
        if authenticated_user:
            return list(authenticated_user.groups.values_list('name', flat=True))
        else:
            return []
    
    try:
        data = request.data
        user_group_list = get_group_list(request)
        
        # ic(data)
        
    
        activate_at = data.get('activate_at')
        deactivate_at = data.get('deactivate_at')
        
        nach_for_install = data.get('nach_for_install')
        if nach_for_install or nach_for_install == "True":
            install_price = data.get('install_price')
        else:
            install_price = Decimal(0)

   
        activate_at_datetime = None
        if activate_at:
            activate_at_datetime = datetime.fromisoformat(activate_at)
         
        deactivate_at_datetime = None
        if deactivate_at:  # Только если не пустая строка
            deactivate_at_datetime = datetime.fromisoformat(deactivate_at)
  
        if not activate_at_datetime:
            return Response({"success": False, "error": "Дата активации является обязательным"}, status=400)

        user_id = data.get("user_id")
        
        # ⭐⭐⭐ ДОБАВЛЯЕМ ПРОВЕРКУ ABONPLATA ⭐⭐⭐
        abonplata = data.get('abonplata', '0.00')
        try:
            abonplata_decimal = Decimal(str(abonplata))
            if abonplata_decimal < 0:
                return Response({"success": False, "error": "Abonplata cannot be negative"}, status=400)
        except (ValueError, InvalidOperation):
            return Response({"success": False, "error": "Invalid abonplata format"}, status=400)

        # ⭐⭐⭐ ДОБАВЛЯЕМ ПРОВЕРКУ SERVICES И SERVICE_DATES ⭐⭐⭐
        services_data = data.get('services', [])
        service_dates = data.get('service_dates', {})
        
        if not isinstance(services_data, list):
            services_data = []
        if not isinstance(service_dates, dict):
            service_dates = {}
        
        # Проверяем существование всех услуг
        valid_services = []
        for service_id in services_data:
            try:
                service = Service.objects.get(id=service_id, is_active=True)
                valid_services.append(service)
            except Service.DoesNotExist:
                return Response({"success": False, "error": f"Service with id {service_id} does not exist or is not active"}, status=400)

   
        # 1. Проверка обязательных полей
        required_fields = ['number', 'name', 'etrap', 'dogowor', 'login', 'address']
        for field in required_fields:
            if not data.get(field):
                return Response({"success": False, "error": f"Field {field} is required"}, status=400)

        number = str(data['number']).strip()
        dogowor = str(data['dogowor']).strip()
        login = str(data['login']).strip()
        
        # Добавь проверку что не пустые:
        if not number:
            return Response({"success": False, "error": "Number cannot be empty"}, status=400)
        if not dogowor:
            return Response({"success": False, "error": "Dogowor cannot be empty"}, status=400)
        
        if not login:
            return Response({"success": False, "error": "Login cannot be empty"}, status=400)

        # 2. Валидации
        if not number.isdigit() or len(number) != 5:
            return Response({"success": False, "error": "Number must be exactly 5 digits"}, status=400)
        if number not in dogowor:
            return Response({"success": False, "error": "Dogowor must contain abonent number"}, status=400)
        
        if number not in login:
            return Response({"success": False, "error": "Login must contain abonent number"}, status=400)

        is_enterprises = data.get('is_enterprises', False)
        if is_enterprises:
            account = data.get('account')
            hb_type = data.get('hb_type')
            if account in (None, "") or hb_type in (None, ""):
                return Response({"success": False, "error": "Account and HB type are required for enterprises"}, status=400)
            account = str(account).strip()
            hb_type = str(hb_type).strip()
            # Конвертация в int для account
            try:
                account_int = int(account) if account else None
            except ValueError:
                return Response({"success": False, "error": "Account must be a valid number"}, status=400)
    
        
        elif not data.get('surname'):
            return Response({"success": False, "error": "Surname is required for individuals"}, status=400)
        
        etrap_id = data.get("etrap")
        try:
            etrap_obj = Etrap.objects.get(id=etrap_id)
        except Etrap.DoesNotExist:
            return Response({"success": False, "error": "Etrap does not exist"}, status=400)
        
        if 'admin' not in user_group_list:
            if etrap_obj.etrap not in user_group_list:
                return Response({"success": False, "error": "You do not have access to this etrap"}, status=400)

        # Проверка уникальности dogowor
        dogowor_qs = UserDogowor.objects.filter(dogowor=dogowor, balance_type="telefon")
        if user_id:
            dogowor_qs = dogowor_qs.exclude(user_id=user_id)
        if dogowor_qs.exists():
            return Response({"success": False, "error": "Dogowor already exists"}, status=400)
        
        # Проверка уникальности login
        login_qs = UserDogowor.objects.filter(login=login, balance_type="telefon")
        if user_id:
            login_qs = login_qs.exclude(user_id=user_id)
        if login_qs.exists():
            return Response({"success": False, "error": "Login already exists"}, status=400)
        
        
        mobile_number = ''.join(filter(str.isdigit, str(data.get("mobile_number", ""))))
        with transaction.atomic():
            # UPDATE
            if user_id:
                user = get_object_or_404(UserTable, id=user_id)
                
                ah = AbonentHistory(abonent=user, changed_by=request.user, ip_address=get_client_ip(request), action="updated", comment=str(data.get('comment', '')))
                
                
                history_old_data = {}
                history_new_data = {}
                
                
                
                # number
                if user.number.strip() != number.strip():
                    history_new_data.update({
                        "number": number
                    })
                    history_old_data.update({
                        "number": user.number.strip()
                    })
                user.number = number
                
                # name
                new_name = data.get('name')
                if new_name is not None:
                    if user.name.strip() != new_name.strip():
                        history_new_data.update({
                            "name": new_name
                        })
                        history_old_data.update({
                            "name": user.name.strip()
                        })
                    user.name = new_name.strip()    
                    

                # address
                new_address = data.get('address')
                if new_address is not None:
                    if user.address.strip() != new_address.strip():
                        history_new_data.update({
                            "address": new_address
                        })
                        history_old_data.update({
                            "address": user.address.strip()
                        })
                    user.address = str(new_address).strip()
                    
            
                if user.mobile_number.strip() != mobile_number.strip():
                    history_new_data.update({
                        "mobile_number": mobile_number
                    })
                    history_old_data.update({
                        "mobile_number": user.mobile_number.strip()
                    })
                user.mobile_number = mobile_number
                
                
                if user.etrap.id != etrap_obj.id:
                    history_new_data.update({
                        "etrap": f"{etrap_obj.etrap} ({etrap_obj.code})"
                    })
                    history_old_data.update({
                        "etrap": f"{user.etrap.etrap} ({user.etrap.code})"
                    })    
                user.etrap = etrap_obj
                
                if user.is_enterprises != is_enterprises:
                    history_new_data.update({
                        "is_enterprises": is_enterprises
                    })
                    history_old_data.update({
                        "is_enterprises": user.is_enterprises
                    })
                user.is_enterprises = is_enterprises
                
                if user.abonplata != abonplata_decimal:
                    history_new_data.update({
                        "abonplata": f"{str(to_decimal_2(abonplata_decimal))} man"
                    })
                    history_old_data.update({
                        "abonplata": f"{str(to_decimal_2(user.abonplata))} man"
                    })
                user.abonplata = abonplata_decimal
                
                if is_enterprises:
                    if user.account != account_int:
                        history_new_data.update({
                            "account": str(account_int)
                        })
                        history_old_data.update({
                            "account": str(user.account)
                        })
                    user.account = account_int
                    old_hb_type = user.hb_type if user.hb_type not in [None, ''] else ''
                    new_hb_type = hb_type if hb_type not in [None, ''] else ''
                    if old_hb_type != new_hb_type:
                        ic(user.hb_type)
                        ic(hb_type)
                        history_new_data.update({
                            "hb_type": hb_type
                        })
                        history_old_data.update({
                            "hb_type": user.hb_type
                        })
                    user.hb_type = hb_type
                    
                    if user.surname != "":
                        history_new_data.update({
                            "surname": ""
                        })
                        history_old_data.update({
                            "surname": user.surname
                        })
                    user.surname = ''
                    
                    if user.patronymic != "":
                        history_new_data.update({
                            "patronymic": ""
                        })
                        history_old_data.update({
                            "patronymic": user.patronymic
                        })
                    user.patronymic = ''
                else:
                    # surname ilat
                    new_surname = str(data.get('surname')).strip()
                    if user.surname.strip() != new_surname:
                        history_new_data.update({
                            "surname": new_surname
                        })
                        history_old_data.update({
                            "surname": user.surname.strip()
                        })
                    user.surname = str(new_surname).strip()
                        
                    if not user.surname:
                        return Response({"success": False, "error": "Surname is required for individuals"}, status=400)

                    new_patronymic = data.get('patronymic', "").strip()
                    if user.patronymic.strip() != new_patronymic:
                        history_new_data.update({
                            "patronymic": new_patronymic
                        })
                        history_old_data.update({
                            "patronymic": user.patronymic.strip()
                        })
                    user.patronymic = str(new_patronymic).strip()
                    
                    if user.account != None:
                        history_new_data.update({
                            "account": None
                        })
                        history_old_data.update({
                            "account": str(user.account)
                        })    
                    user.account = None
                    
                    if user.hb_type not in [None, '']:
                        history_new_data.update({
                            "hb_type": None
                        })
                        history_old_data.update({
                            "hb_type": user.hb_type
                        }) 
                    user.hb_type = '' 
                user.save()

                # ⭐⭐⭐ ОБНОВЛЯЕМ УСЛУГИ С УЧЕТОМ SERVICE_DATES ⭐⭐⭐
                # Получаем существующие услуги пользователя
                existing_user_services = UserService.objects.filter(user=user)
                
                # Создаем словарь существующих услуг для быстрого доступа
                existing_services_dict = {us.service_id: us for us in existing_user_services}
                
                # Обрабатываем услуги из запроса
                new_services_to_charge = []  # Список новых услуг для списания
                add_service_for_history = []
                deleted_service_for_history = []
                for service in valid_services:
                    service_id = str(service.id)
                    
                    service_date_info = service_dates.get(service_id, {})
                    
                    activate_date = service_date_info.get('activate_at')
                    deactivate_date = service_date_info.get('deactivate_at')
                    service_comment = service_date_info.get("comment", "")
                
                    
                    # Преобразуем даты в datetime объекты
                    activate_datetime = None
                    if activate_date:
                        activate_datetime = datetime.fromisoformat(activate_date)
                    
                    deactivate_datetime = None
                    if deactivate_date:
                        deactivate_datetime = datetime.fromisoformat(deactivate_date)
                        
                    # ⭐⭐⭐ ПРОВЕРЯЕМ НОВАЯ ЛИ УСЛУГА И АКТИВНА ЛИ ОНА ⭐⭐⭐
                    is_new_service = service.id not in existing_services_dict
                    is_service_active = activate_datetime and not deactivate_datetime
                    
                    # Если услуга НОВАЯ и АКТИВНА - добавляем к списанию
                    if is_new_service and is_service_active:
                        new_services_to_charge.append([service, activate_datetime, deactivate_datetime, service_comment])  # Для логирования
                        service_history = {
                            "service": service.service, "price": str(to_decimal_2(service.price)), "activate_at": str(format_datetime_ru(activate_datetime)), "deactivate_at": str(format_datetime_ru(deactivate_datetime)) if deactivate_datetime else '', "service_comment": service_comment
                        }
                        add_service_for_history.append(service_history)
                    
                    # Если услуга уже существует - обновляем
                    if service.id in existing_services_dict:
                        user_service = existing_services_dict[service.id]
                        
                        # ⭐⭐⭐ ЕСЛИ СУЩЕСТВУЮЩАЯ УСЛУГА БЫЛА ОТКЛЮЧЕНА И СНОВА АКТИВИРУЕТСЯ - СПИСЫВАЕМ ⭐⭐⭐
                        was_service_deactivated = user_service.date_end is not None
                        is_reactivating = was_service_deactivated and not deactivate_datetime
                        
                        if is_reactivating:
                            new_services_to_charge.append([service, activate_datetime, deactivate_datetime, service_comment])
                            service_history = {
                                "service": service.service, "price": str(to_decimal_2(service.price)), "activate_at": str(format_datetime_ru(activate_datetime)), "deactivate_at": str(format_datetime_ru(deactivate_datetime)) if deactivate_datetime else '', "service_comment": service_comment
                            }
                            add_service_for_history.append(service_history)
            
                        # Обновляем даты если они изменились
                        if activate_datetime:
                            user_service.date_connected = activate_datetime
                        if deactivate_datetime:
                            user_service.date_end = deactivate_datetime
                            user_service.is_active = False
                            del_service_history = {
                                "service": service.service, "price": str(to_decimal_2(service.price)), "activate_at": str(format_datetime_ru(activate_datetime)), "deactivate_at": str(format_datetime_ru(deactivate_datetime)) if deactivate_datetime else '', "service_comment": service_comment
                            }
                            deleted_service_for_history.append(del_service_history)
                        elif deactivate_date == "":  # Если дата деактивации очищена
                            user_service.date_end = None
                            user_service.is_active = True
                        user_service.comment = service_comment
                        
                        user_service.updated_by = request.user if request.user.is_authenticated else None
                        user_service.save()
                    else:
                        # Создаем новую услугу
                        UserService.objects.create(
                            user=user,
                            service=service,
                            actual_price=service.price,
                            date_connected=activate_datetime or activate_at_datetime,
                            date_end=deactivate_datetime,
                            is_active=not bool(deactivate_datetime),  # Активна если нет даты отключения
                            connected_by=request.user if request.user.is_authenticated else None,
                            comment=service_comment
                        )
                
     
                # ic(new_services_to_charge)
                # Удаляем услуги которые больше не выбраны
                current_service_ids = [service.id for service in valid_services]
                services_to_delete = existing_user_services.exclude(service_id__in=current_service_ids)
                services_to_delete.delete()

                dogowor_obj = get_object_or_404(UserDogowor, id=data.get("dogowor_id"))
                dogowor_obj.dogowor = dogowor
                dogowor_obj.login = login
                dogoworBalance = DogoworBalance.objects.get(dogowor=dogowor_obj)
                
                # nowye ustanowlennye uslugi
                if len(new_services_to_charge) > 0:
                    add_service_for_history = []
                    for i in new_services_to_charge:
                        s = i[0]
                        a = i[1]
                        d = i[2]
                        c = i[3]
                        # ic(a)
                        DogoworAccrual.objects.create(dogowor=dogowor_obj, amount=Decimal(s.price), category="uslugi", description=s.service, period=d)
                        dogoworBalance.amount -= Decimal(s.price)
                        service_history = {
                            "service": s.service, "price": str(to_decimal_2(s.price)), "activate_at": str(format_datetime_ru(a)), "deactivate_at": str(format_datetime_ru(d)) if d else '', "service_comment": c
                        }
                        add_service_for_history.append(service_history)
                if add_service_for_history:
                    history_new_data.update({
                        "added_services": add_service_for_history
                    })
                    
                if deleted_service_for_history:
                    history_new_data.update({
                        "deleted_services": deleted_service_for_history
                    })
                    
                    
                        
                # if abonplata_decimal > 0 or Decimal(install_price) > 0:
                #     total_abonplata_price = abonplata_decimal + Decimal(install_price)
                #     DogoworAccrual.objects.create(dogowor=dogowor_obj, amount=Decimal(total_abonplata_price), category="abonplata", description="abonplata", period=activate_at_datetime)
                #     dogoworBalance.amount -= Decimal(total_abonplata_price)
                        
                dogoworBalance.save()
                
                new_comment = data.get('comment')
                if new_comment is not None:
                    dogowor_obj.comment = str(new_comment).strip()
                    
                dogowor_obj.activate_at = activate_at_datetime
                
                if deactivate_at is not None:
                    dogowor_obj.deactivate_at = deactivate_at_datetime if deactivate_at else None
                    
                    # Если установлена дата деактивации договора - отключаем все активные услуги
                    if deactivate_at_datetime:
                        UserService.objects.filter(
                            user=user, 
                            is_active=True,
                            date_end__isnull=True  # Только те, у которых нет даты отключения
                        ).update(
                            date_end=deactivate_at_datetime,
                            is_active=False,
                            updated_by=request.user if request.user.is_authenticated else None
                        )
                
                dogowor_obj.save()
                if history_new_data or history_old_data:
                    ah.old_value = json.dumps(history_old_data, ensure_ascii=False, indent=2)
                    ah.new_value = json.dumps(history_new_data, ensure_ascii=False, indent=2)
                    ah.save()
                else:
                    # tut ya mogu otkatit transaction tak kak nechego sohranyat? 
                    pass
                
                message = "Abonent updated successfully"
                

            else:
                # CREATE
                ic("CREATE")
                name_cleaned = str(data.get('name', '')).strip()
                if not name_cleaned:  # Проверка после очистки
                    return Response({"success": False, "error": "Name is required for individuals"}, status=400) 
                history_data = {
                    "number": number,
                    "etrap": f"{etrap_obj.etrap} ({etrap_obj.code})",
                    "dogowor": dogowor,
                    "login": login,
                    "mobile_number": mobile_number,
                    "address": data.get('address', '').strip(),
                    "abonplata": str(abonplata_decimal),
                    "is_enterprises": is_enterprises
                }
                
                if is_enterprises:
                    history_data.update({
                        "name": name_cleaned,
                        "account": account_int,
                        "hb_type": hb_type
                    })
                    user = UserTable.objects.create(
                        number=number,
                        name=name_cleaned,
                        etrap=etrap_obj,
                        is_enterprises=True,
                        address=str(data.get('address', '')).strip(),
                        mobile_number=mobile_number,
                        account=account_int,
                        hb_type=hb_type,
                        # ⭐⭐⭐ СОХРАНЯЕМ ABONPLATA ⭐⭐⭐
                        abonplata=abonplata_decimal
                    )
                else:
                    surname_cleaned = str(data.get('surname', '')).strip()
                    if not surname_cleaned:  # Проверка после очистки
                        return Response({"success": False, "error": "Surname is required for individuals"}, status=400)        
                                
                    history_data.update({
                        "surname": surname_cleaned,
                        "name": name_cleaned,
                        "patronymic": data.get('patronymic', '').strip()
                    })
                    user = UserTable.objects.create(
                        number=number,
                        name=name_cleaned,
                        surname=surname_cleaned,
                        patronymic=str(data.get('patronymic', '')).strip(),
                        etrap=etrap_obj,
                        is_enterprises=False,
                        address=str(data.get('address', '')).strip(),
                        mobile_number=mobile_number,
                        # ⭐⭐⭐ СОХРАНЯЕМ ABONPLATA ⭐⭐⭐
                        abonplata=abonplata_decimal
                    )

                    
                    
                # ⭐⭐⭐ ДОБАВЛЯЕМ УСЛУГИ С УЧЕТОМ SERVICE_DATES ⭐⭐⭐

                new_services_to_charge = []
                add_service_for_history = []
                for service in valid_services:
                    service_id = str(service.id)
                    service_date_info = service_dates.get(service_id, {})
                    
            
                    activate_date = service_date_info.get('activate_at')
                    deactivate_date = service_date_info.get('deactivate_at')
                    
                    service_comment = service_date_info.get('comment', "")
                    
                    new_services_to_charge.append(service)
                    
                    # Преобразуем даты в datetime объекты
                    activate_datetime = activate_at_datetime  # По умолчанию используем общую дату активации
                    if activate_date:
                        activate_datetime = datetime.fromisoformat(activate_date)
                    
                    deactivate_datetime = None
                    if deactivate_date:
                        deactivate_datetime = datetime.fromisoformat(deactivate_date)
                    
                    UserService.objects.create(
                        user=user,
                        service=service,
                        actual_price=service.price,
                        date_connected=activate_datetime,
                        date_end=deactivate_datetime,
                        is_active=not bool(deactivate_datetime),  # Активна если нет даты отключения
                        connected_by=request.user if request.user.is_authenticated else None,
                        comment=service_comment
                    )
                 
                    service_history = {
                        "service": service.service, "price": service.price, "activate_at": str(activate_datetime), "deactivate_at": str(deactivate_datetime) if deactivate_datetime else '', "service_comment": service_comment
                    }
                    add_service_for_history.append(service_history)
                
                history_data.update({
                    "added_services": add_service_for_history
                })
                
                
      
                dogowor_obj = UserDogowor.objects.create(
                    user=user,
                    dogowor=dogowor,
                    login=login,
                    balance_type='telefon',
                    activate_at=activate_at_datetime,
                    deactivate_at=deactivate_at_datetime,
                    comment=str(data.get('comment', ''))
                )
                history_data.update({
                    "dogowor_login": {"dogowor": dogowor_obj.dogowor, "login": dogowor_obj.login, "activate_at": str(format_datetime_ru(dogowor_obj.activate_at)), "deactivate_at": str(format_datetime_ru(dogowor_obj.deactivate_at)) if dogowor_obj.deactivate_at else '', "comment": dogowor_obj.comment},
                })
                dogoworBalance = DogoworBalance.objects.create(dogowor=dogowor_obj)
                if len(new_services_to_charge) > 0:
                    total_services_price = 0
                    for s in new_services_to_charge:
                        if s.price > 0:
                            DogoworAccrual.objects.create(dogowor=dogowor_obj, amount=Decimal(s.price), category="uslugi", description=s.service, period=activate_at_datetime)
                            dogoworBalance.amount -= Decimal(s.price)
                            total_services_price += Decimal(s.price)
                            
                        else:
                            DogoworAccrual.objects.create(dogowor=dogowor_obj, amount=Decimal("2.00"), category="kod ustanowka", description=s.service, period=activate_at_datetime)
                            dogoworBalance.amount -= Decimal("2.00")
                            total_services_price += Decimal("2.00")
                            
                    history_data.update({
                            "nachisleniya service": {"services": f"{str(to_decimal_2(total_services_price))} man"}
                        })
                            
                        
                if abonplata_decimal > 0 or Decimal(install_price) > 0:
                    total_abonplata_price = abonplata_decimal + Decimal(install_price)
                    DogoworAccrual.objects.create(dogowor=dogowor_obj, amount=Decimal(total_abonplata_price), category="abonplata", description="abonplata", period=activate_at_datetime)
                    dogoworBalance.amount -= Decimal(total_abonplata_price)
                    history_data.update({
                        "nachisleniya abonplata": {"abonplata": f"{str(to_decimal_2(total_abonplata_price))} man"}
                        })
                    
                dogoworBalance.save()
                
                ah = AbonentHistory(
                    abonent=user,
                    dogowor=dogowor_obj,
                    changed_by=request.user,
                    ip_address=get_client_ip(request),
                    action="installed",
                    old_value="{}",
                    new_value=json.dumps(history_data, ensure_ascii=False, indent=2),
                    comment=str(data.get('comment', ''))
                )

                ah.save()
                
                message = "Abonent created successfully"

        return Response({"success": True, "message": message}, status=201)

    except Exception as e:
        ic(e)
        return Response({"success": False, "error": str(e)}, status=400)
    
    

@api_view(['GET'])    
def get_user(request, user_id):
    user = get_object_or_404(UserTable, id=user_id)
    
    
    # Возвращаем данные пользователя, а не просто success
    user_data = {
        'id': user.id,
        'name': user.name,
        'surname': user.surname,
        'patronymic': user.patronymic,
        'number': user.number,
        'etrap': {
            "etrap": user.etrap.etrap,
            "code": user.etrap.code
        },
        # добавьте другие поля которые нужны на фронтенде
    }
    
    return Response(user_data, status=200)


@api_view(['POST'])
def save_dogowor(request, user_id):
    ic("save_dogowor")
    
    try:
        data = request.data
        ic(user_id)
        user = get_object_or_404(UserTable, pk=user_id)
            
        # ic(user)
        user_group_list = get_group_list(request)
        ic(data)
        type_ = data.get("type")
        
        
        comment = data.get("comment")

        if not type_:
            return Response({"success": False, "error": "type required"}, status=400)

        type_ = type_.lower()

        if type_ not in ["iptv", "internet", "ctv"]:
            return Response({"success": False, "error": "choose internet, alem tv or kabel TV"}, status=400)
        
        dogowor = data.get("dogowor")
        if not dogowor:
            return Response({"success": False, "error": "dogowor is required"}, status=400)
        
        login = data.get("login")
        if not login:
            return Response({"success": False, "error": "login is required"}, status=400)
        
        dogowor = str(dogowor).strip()
        login = str(login).strip()   
        if len(dogowor) < 3:
            return Response({"success": False, "error": "dogowor error"}, status=400)
        if len(login) < 3:
            return Response({"success": False, "error": "login error"}, status=400)
        
        activateDate = data.get("activateDate")
        if not activateDate:
            return Response({"success": False, "error": "activate date cant be empty"}, status=400)
        activate_datetime = datetime.fromisoformat(activateDate)
            
        deactivateDate = data.get("deactivateDate")  
        deactivate_datetime = None
        if deactivateDate:
            deactivate_datetime = datetime.fromisoformat(deactivateDate)
            
        

        
        
        
        
        if type_ == "iptv":
            if "admin" not in user_group_list:
                if "iptv" not in dogowor.lower() or "iptv" not in login.lower():
                    return Response({"success": False, "error": "iptv must be in dogowor and login"}, status=400)
            
            if UserDogowor.objects.filter(dogowor=dogowor).exists():
                return Response({"success": False, "error": "Dogowor already exists"}, status=400)
            
            if UserDogowor.objects.filter(login=login).exists():
                return Response({"success": False, "error": "Login already exsist"}, status=400)
            
            with transaction.atomic():
                userdogowor = UserDogowor.objects.create(
                    user=user, 
                    dogowor=dogowor, 
                    login=login, 
                    activate_at=activate_datetime, 
                    deactivate_at=deactivate_datetime,
                    balance_type="iptv",
                    comment=comment
                    )
                
                DogoworBalance.objects.create(dogowor=userdogowor)
                
                history_data = {
                    "number": user.number,
                    "etrap": f"{user.etrap.etrap} ({user.etrap.code})",
                    "dogowor": dogowor,
                    "login": login,
                    "comment": str(comment),
                    "is_enterprises": user.is_enterprises,
                    "activate_at": format_datetime_ru(activate_datetime) if activate_datetime != None else "",
                    "deactivate_at": format_datetime_ru(deactivate_datetime) if deactivate_datetime != None else "",
                }
                
                ah = AbonentHistory(
                    abonent=user,
                    dogowor=userdogowor,
                    changed_by=request.user,
                    ip_address=get_client_ip(request),
                    action="installed new IPTV dogowor",
                    old_value="{}",
                    new_value=json.dumps(history_data, ensure_ascii=False, indent=2),
                    comment=str(comment)
                )

                ah.save()
                
        
            
            

    
        return Response({"success": True, "message": "success save"}, status=201)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=400)