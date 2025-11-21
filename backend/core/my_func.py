from .models import AbonentHistory
from decimal import Decimal, ROUND_DOWN
from datetime import datetime


# def record_abonent_history(abonent, request, action, field_name='', old_value=None, new_value=None, comment=''):
#     ip = get_client_ip(request)
#     AbonentHistory.objects.create(
#         abonent=abonent,
#         changed_by=request.user if request.user.is_authenticated else None,
#         ip_address=ip,
#         action=action,
#         field_name=field_name,
#         old_value=str(old_value) if old_value is not None else '',
#         new_value=str(new_value) if new_value is not None else '',
#         comment=comment
#     )

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def to_decimal_2(value):
    """
    Преобразует число или строку в Decimal с 2 знаками после запятой.
    Например:
      "2" -> 2.00
      2 -> 2.00
      "2.1" -> 2.10
      2.1 -> 2.10
    """
    return Decimal(str(value)).quantize(Decimal("0.00"), rounding=ROUND_DOWN)




def format_datetime_ru(value):
    """
    Преобразует дату '2025-11-17 10:21:00' в '17.11.2025 10:21:00'
    Работает и со строкой, и с datetime.
    """
    # Если получена строка — парсим
    if isinstance(value, str):
        dt = datetime.fromisoformat(value)
    else:
        dt = value

    return dt.strftime("%d.%m.%Y %H:%M:%S")