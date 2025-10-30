from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction
from datetime import datetime
from .models import Etrap, UserTable, UserDogowor, DogoworBalance



@api_view(['POST'])
def create_200_test_users(request):
    try:
        with transaction.atomic():
            # Получаем все активные этрапы
            active_etraps = Etrap.objects.filter(is_active=True)
            
            if not active_etraps:
                return Response({
                    "success": False,
                    "error": "No active etraps found"
                }, status=400)
            
            users_created = 0
            enterprises_created = 0
            base_number = 20000
            enterprise_base_number = 30000
            
            # Данные для тестовых пользователей
            test_users_data = [
                {
                    "surname": "Sharipov",
                    "name": "Anvar", 
                    "patronymic": "Kutlimuratowich",
                    "address": "Merkez-2, jay-3, oy 55"
                },
                {
                    "surname": "Meredow",
                    "name": "Merdan",
                    "patronymic": "Amanowich", 
                    "address": "Merkez-1, jay-4, oy 70"
                }
            ]
            
            # Данные для предприятий
            enterprise_names = [
                "Türkmen Telekeçiilik",
                "Daşoguz Azyk Önümleri", 
                "Garaşsyzlyk Däkanlar Zynjry",
                "Boldumsaz Senagat Kärhanasy",
                "Gubadag Hojalyk Hyzmatlary"
            ]
            
            # Создаем по 200 пользователей на каждый этрап
            for etrap in active_etraps:
                for i in range(200):
                    user_number = base_number + users_created
                    
                    # Проверяем уникальность номера
                    if UserTable.objects.filter(number=str(user_number)).exists():
                        users_created += 1
                        continue
                    
                    # Чередуем данные тестовых пользователей
                    user_data = test_users_data[i % len(test_users_data)]
                    
                    # Создаем пользователя
                    user = UserTable.objects.create(
                        number=str(user_number),
                        etrap=etrap,
                        name=user_data["name"],
                        surname=user_data["surname"],
                        patronymic=user_data["patronymic"],
                        address=user_data["address"],
                        mobile_number=f"61{300000 + users_created:06d}"[-8:],
                        is_enterprises=False,
                        is_active=True
                    )
                    
                    # Создаем договор
                    dogowor_number = f"993322{user_number}"
                    
                    # Проверяем уникальность договора
                    if not UserDogowor.objects.filter(dogowor=dogowor_number).exists():
                        dogowor_obj = UserDogowor.objects.create(
                            user=user, 
                            dogowor=dogowor_number, 
                            balance_type='telefon', 
                            activate_at=datetime.now()
                        )
                        
                        # Создаем баланс
                        DogoworBalance.objects.create(dogowor=dogowor_obj)
                    
                    users_created += 1
            
            # Создаем по 50 предприятий на каждый этрап
            for etrap in active_etraps:
                for i in range(50):
                    enterprise_number = enterprise_base_number + enterprises_created
                    
                    # Проверяем уникальность номера предприятия
                    if UserTable.objects.filter(number=str(enterprise_number)).exists():
                        enterprises_created += 1
                        continue
                    
                    enterprise_name = enterprise_names[i % len(enterprise_names)]
                    
                    # Создаем предприятие
                    enterprise = UserTable.objects.create(
                        number=str(enterprise_number),
                        etrap=etrap,
                        name=f"{enterprise_name} {etrap.etrap}",
                        is_enterprises=True,
                        address=f"{etrap.etrap} şäheri, Merkezi köçe {i+1}",
                        mobile_number=f"12{400000 + enterprises_created:06d}"[-8:],
                        account=1000000 + enterprises_created,
                        hb_type="budjet" if i % 2 == 0 else "hoz",
                        is_active=True
                    )
                    
                    # Создаем договор для предприятия
                    enterprise_dogowor = f"993333{enterprise_number}"
                    
                    # Проверяем уникальность договора
                    if not UserDogowor.objects.filter(dogowor=enterprise_dogowor).exists():
                        enterprise_dogowor_obj = UserDogowor.objects.create(
                            user=enterprise, 
                            dogowor=enterprise_dogowor, 
                            balance_type='telefon', 
                            activate_at=datetime.now()
                        )
                        
                        # Создаем баланс
                        DogoworBalance.objects.create(dogowor=enterprise_dogowor_obj)
                    
                    enterprises_created += 1
            
            total_created = users_created + enterprises_created
            
            return Response({
                "success": True,
                "message": f"Successfully created {users_created} users and {enterprises_created} enterprises across {active_etraps.count()} etraps",
                "details": {
                    "individual_users": users_created,
                    "enterprises": enterprises_created,
                    "total": total_created,
                    "etraps_count": active_etraps.count()
                }
            }, status=201)
            
    except Exception as e:
        return Response({
            "success": False,
            "error": f"Error creating test users: {str(e)}"
        }, status=400)