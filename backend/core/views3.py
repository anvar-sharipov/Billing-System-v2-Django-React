import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import AbonentHistory, UserTable, UserService
from icecream import ic
from datetime import datetime
import json

current_year = datetime.now().year

@api_view(['GET'])
def get_user_history(request):
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=401)
    
    user_id = request.GET.get('user_id')
    
    abonent_history = AbonentHistory.objects.filter(abonent=user_id).order_by("-created_at")
    
    
    
    history_data = []
    for ah in abonent_history:
        # Парсим JSON данные если они есть
        old_value_parsed = None
        new_value_parsed = None
        ic(ah.changed_by.last_name)
        
        try:
            if ah.old_value:
                old_value_parsed = json.loads(ah.old_value)
            if ah.new_value:
                new_value_parsed = json.loads(ah.new_value)
        except json.JSONDecodeError:
            # Если не JSON, оставляем как есть
            old_value_parsed = ah.old_value
            new_value_parsed = ah.new_value
        
        history_data.append({
            "id": ah.id,
            "action": ah.get_action_display(),
            "field_name": ah.field_name,
            "old_value": old_value_parsed,
            "new_value": new_value_parsed,
            "comment": ah.comment,
            "created_at": ah.created_at.strftime("%d.%m.%Y %H:%M"),
            "changed_by": ah.changed_by.username if ah.changed_by else "Система",
            "changed_by_surname": ah.changed_by.last_name if ah.changed_by else "Система",
            "changed_by_name": ah.changed_by.first_name if ah.changed_by else "Система",
            "ip_address": ah.ip_address
        })
        # ic(history_data)
        
    return Response({
        "success": True,
        "user_id": user_id,
        "history": history_data,
    })
    
    
    

@api_view(['GET'])
def get_user_for_kassa(request, user_id):
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=401)
    
    
    ic(current_year)
    

    # if not years:
    #     current_year = datetime.now().year
    #     years = [current_year]
        
    user = UserTable.objects.get(id=user_id)
    if user.etrap:
        etrap_json = {"id": user.etrap.id, "etrap": user.etrap.etrap, "code": user.etrap.code}
    else:
        etrap_json = ""
        
    services_json = []
    if user.services:    
        user_services = UserService.objects.filter(user=user)
        for us in user_services:
            
            connected_by_json = ""
            if us.connected_by:
                connected_by_json = {
                    "username" : us.connected_by.username,
                    "first_name" : us.connected_by.first_name,
                    "last_name" : us.connected_by.last_name,
                }
                
            updated_by_json = ""
            if us.updated_by:
                updated_by_json = {
                    "username" : us.updated_by.username,
                    "first_name" : us.updated_by.first_name,
                    "last_name" : us.updated_by.last_name,
                }
                
            services_json.append({
                "id": us.service.id,
                "name": us.service.service,
                "date_end": us.date_end,
                "is_active": us.is_active,
                "actual_price": us.actual_price,
                "price": us.service.price,
                "connected_by": connected_by_json,
                "comment": us.comment,
                "date_connected": us.date_connected,
                "updated_by_json": updated_by_json,
                "date_updated": us.date_updated,
            })
            # ic(us.service)
        
    all_dogowors = user.dogowors.all()
    
    dogowors_json = []
    if all_dogowors:
        
        for dogowor in all_dogowors:
            d = {
                "type": dogowor.balance_type,
                "dogowor": dogowor.dogowor,
                "login": dogowor.login,
                "activate_at": dogowor.activate_at,
                "deactivate_at": dogowor.deactivate_at,
                "comment": dogowor.comment,
                'balance': dogowor.balance.amount
            }
            
            dogowors_json.append(d)

    
    user_data = {
        "number" : user.number,
        "surname" : user.surname,
        "name" : user.name,
        "patronymic" : user.patronymic,
        "etrap" : etrap_json,
        "address" : user.address,
        "mobile_number" : user.mobile_number,
        "is_enterprises" : user.is_enterprises,
        "account" : user.account,
        "abonplata" : user.abonplata,
        "hb_type" : user.hb_type,
        "service_json": services_json,
    }
    

    
    for dog in user.dogowors.all():
        accruals = dog.accruals.filter(date_created__year=current_year)
        # ic(dog.balance_type, accruals)
    
    data = {
        "user_data": user_data,
        "dogowors_json": dogowors_json
    } 
    
    return Response(data)