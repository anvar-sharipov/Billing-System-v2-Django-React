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
from .models import Etrap, UserTable, UserDogowor, DogoworBalance, DogoworAccrual
from .serializers import EtrapSerializer

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.exceptions import ValidationError
import re
from datetime import datetime
from django.db import transaction


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
            
            
            ic(list(df.columns))
            
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
            
            ic(user_data)
            # Если есть ошибки, возвращаем их
            ic(errors)
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
def create_abonent(request):
    try:
        data = request.data
        
        # 1. Required fields
        required_fields = ['number', 'name', 'etrap', 'dogowor']
        for field in required_fields:
            if not data.get(field):
                return Response({
                    "success": False,
                    "error": f"Field {field} is required"
                }, status=400)
        
        # 2. Number validation (digits only)
        number = data['number']
        if not number.isdigit():
            return Response({
                "success": False,
                "error": "Number must contain only digits"
            }, status=400)
        
        # 3. Mobile number validation (optional)
        # mobile_number = data.get('mobile_number')
        # if mobile_number and not mobile_number.isdigit():
        #     return Response({
        #         "success": False,
        #         "error": "Mobile number must contain only digits"
        #     }, status=400)
        
        # 4. Check number uniqueness
        # if Abonent.objects.filter(number=number).exists():
        #     return Response({
        #         "success": False, 
        #         "error": "Abonent with this number already exists"
        #     }, status=400)
        
        # 5. Dogowor validation (must end with number)
        dogowor = data['dogowor']
        if not str(number) in str(dogowor):
            return Response({
                "success": False,
                "error": "Contract number must end with abonent number"
            }, status=400)
            
            
        
        # 6. For enterprises, validate account and hb_type
        if data.get('is_enterprises'):
            if not data.get('account'):
                return Response({
                    "success": False,
                    "error": "Account is required for enterprises"
                }, status=400)
            if not data.get('hb_type'):
                return Response({
                    "success": False, 
                    "error": "HB type is required for enterprises"
                }, status=400)
        
        # 7. For individuals, validate surname
        if not data.get('is_enterprises') and not data.get('surname'):
            return Response({
                "success": False,
                "error": "Surname is required for individuals"
            }, status=400)
            
        
        etrap_id = data.get("etrap")
        if not Etrap.objects.filter(id=etrap_id).exists():
            return Response({
                "success": False,
                "error": "Etrap dosnt exsist in db"
            }, status=400)
        else:
            etrap_obj = Etrap.objects.get(id=etrap_id)
            
        number = data.get("number")
        # Проверка длины
        if len(number) != 5:
            return Response({
                "success": False,
                "error": "Number must be exactly 5 characters long"
            }, status=400)

        # Проверка что состоит только из цифр
        if not number.isdigit():
            return Response({
                "success": False, 
                "error": "Number must contain only digits"
            }, status=400)
            
        name = data.get('name')
        
        is_enterprises = data.get('is_enterprises')
        address = data.get('address')
        mobile_number = data.get('mobile_number')
        is_active = data.get('is_active')
        
        # ic(name)
        # ic(is_enterprises)
        # ic(address)
        # ic(mobile_number)
        # ic(is_active)
        
        if UserDogowor.objects.filter(dogowor=dogowor, balance_type="telefon").exists():
            return Response({
                "success": False, 
                "error": "Dogowor already exsist"
            }, status=400)
        
        print("Data validation passed!")
        
        try:
            with transaction.atomic():
                if is_enterprises:
                    account = data.get('account')
                    hb_type = data.get('hb_type')
                    user = UserTable.objects.create(
                        number=number,
                        etrap=etrap_obj,
                        name=name,
                        is_enterprises=True,
                        address=address,
                        mobile_number=mobile_number,
                        is_active=is_active
                    )
                    # ic(account)
                    # ic(hb_type)
                else:
                    surname = data.get('surname')
                    patronymic = data.get('patronymic')
                    user = UserTable.objects.create(
                        number=number,
                        etrap=etrap_obj,
                        name=name,
                        surname=surname,
                        patronymic=patronymic,
                        is_enterprises=False,
                        address=address,
                        mobile_number=mobile_number,
                        is_active=is_active
                    )
                    # ic(surname)
                    # ic(patronymic)
                    
                
                dogowor_obj = UserDogowor.objects.create(user=user, dogowor=dogowor, balance_type='telefon', activate_at=datetime.now())
                DogoworBalance.objects.create(dogowor=dogowor_obj)
                
                return Response({
                    "success": True,
                    "message": "Abonent created successfully"
                }, status=201)

        except Exception as e:
                ic(e)
                return Response({
                    "success": False, 
                    "error": f"transaction error = {str(e)}"
                }, status=400)

        
    except Exception as e:
        return Response({
            "success": False,
            "error": f"not transaction erorr = {str(e)}"
        }, status=400)