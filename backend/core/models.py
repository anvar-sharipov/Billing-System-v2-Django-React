from django.db import models
from decimal import Decimal
from django.conf import settings
from django.db.models import Q



class Etrap(models.Model):
    etrap = models.CharField(max_length=32, verbose_name='Etrap')
    code = models.CharField(max_length=8, verbose_name='Code')
    is_active = models.BooleanField(default=False, verbose_name='Активный?', blank=True)

    class Meta:
        verbose_name = "Этрап"
        verbose_name_plural = "Этрапы"
        ordering = ["code"]

    def __str__(self):
        return f"{self.etrap} ({self.code})"


# class UserTable(models.Model):
#     TYPE_CHOICES = [("hoz", "Хозяйственный"), ("budjet", "Бюджетный")]

#     number = models.CharField(max_length=8, verbose_name='Номер телефона')
#     etrap = models.ForeignKey(Etrap, on_delete=models.PROTECT)
#     name = models.CharField(max_length=500, verbose_name='Имя', blank=True)
#     surname = models.CharField(max_length=500, verbose_name='Фамилия', blank=True)
#     patronymic = models.CharField(max_length=500, verbose_name='Отчество', blank=True)
#     address = models.CharField(max_length=500, verbose_name='Адрес', blank=True)
#     mobile_number = models.CharField(max_length=32, verbose_name='Сотовый номер', blank=True)
#     is_enterprises = models.BooleanField(default=False, verbose_name='Предприятия', blank=True)
#     account = models.IntegerField(verbose_name='Счёт', blank=True, null=True)
#     hb_type = models.CharField(max_length=6, choices=TYPE_CHOICES, verbose_name='Хоз/Бюджет', blank=True)

#     class Meta:
#         verbose_name = 'Абонент'
#         verbose_name_plural = 'Абоненты'
#         ordering = ['-number']

#     def __str__(self):
#         return f"{self.number} {self.etrap} ({self.get_hb_type_display()})"

class UserTable(models.Model):
    TYPE_CHOICES = [
        ("hoz", "Хозяйственный"), 
        ("budjet", "Бюджетный")
    ]

    number = models.CharField(max_length=8, verbose_name='Номер телефона')
    etrap = models.ForeignKey('Etrap', on_delete=models.PROTECT)  # Добавь app_name если нужно
    name = models.CharField(max_length=500, verbose_name='Имя', blank=True)
    surname = models.CharField(max_length=500, verbose_name='Фамилия', blank=True)
    patronymic = models.CharField(max_length=500, verbose_name='Отчество', blank=True)
    address = models.CharField(max_length=500, verbose_name='Адрес', blank=True)
    mobile_number = models.CharField(max_length=32, verbose_name='Сотовый номер', blank=True)
    is_enterprises = models.BooleanField(default=False, verbose_name='Предприятия')
    account = models.IntegerField(verbose_name='Счёт', blank=True, null=True)
    abonplata = models.DecimalField(max_digits=8, decimal_places=2, verbose_name='Абонплата', default=0.00, blank=True)
    
    hb_type = models.CharField(
        max_length=6, 
        choices=TYPE_CHOICES, 
        verbose_name='Хоз/Бюджет', 
        blank=True
    )
    
    # ⭐⭐⭐ ВАЖНО: Добавляем связь с услугами ⭐⭐⭐
    services = models.ManyToManyField(
        "Service", 
        through='UserService',  # Промежуточная модель для дополнительных полей
        through_fields=('user', 'service'),
        verbose_name='Услуги',
        blank=True
    )

    class Meta:
        verbose_name = 'Абонент'
        verbose_name_plural = 'Абоненты'
        ordering = ['-number']

    def __str__(self):
        return f"{self.number} {self.etrap} ({self.get_hb_type_display()})"


class BalanceType(models.TextChoices):
    TELEFON = "telefon", "Телефония"
    INTERNET = "internet", "Интернет"
    BELET = "belet", "Belet"
    IPTV = "iptv", "IPTV"
    CTV = "ctv", "CTV"


class UserDogowor(models.Model):
    user = models.ForeignKey(UserTable, verbose_name='Абонент', on_delete=models.CASCADE, related_name="dogowors")
    dogowor = models.CharField(max_length=500, verbose_name='Договор')
    login = models.CharField(max_length=500, verbose_name='Логин', null=True, blank=True)
    balance_type = models.CharField(max_length=50, choices=BalanceType.choices, verbose_name="Тип услуги")
    activate_at = models.DateTimeField(verbose_name="Дата Подключения", null=True, blank=True)
    deactivate_at = models.DateTimeField(verbose_name="Дата Отключения", null=True, blank=True)
    comment = models.TextField(blank=True, verbose_name="Описание действия")
    

    def __str__(self):
        return f"{self.user.number} — {self.dogowor} ({self.get_balance_type_display()})"
    
    



class DogoworBalance(models.Model):
    dogowor = models.OneToOneField(UserDogowor, verbose_name="Договор", on_delete=models.CASCADE, related_name="balance")
    amount = models.DecimalField(max_digits=12, decimal_places=4, default=Decimal('0.0000'))

    class Meta:
        verbose_name = "Баланс"
        verbose_name_plural = "Балансы"

    def __str__(self):
        return f"{self.dogowor.dogowor}: {self.amount}"


class DogoworAccrual(models.Model):
    CATEGORY_CHOICES = [
        ('abonplata', 'Абонплата'),
        ('slr', 'SLR'),
        ('kod', 'KOD'), 
        ('zakaz', 'ZAKAZ'),
        ('uslugi', 'Услуги'),
        ('internet', 'Интернет'),
        ('belet', 'Belet'),
        ('kabel', 'Кабельное'),
        ('alem', 'Alem'),

    ]
    
    dogowor = models.ForeignKey(UserDogowor, verbose_name="Договор", on_delete=models.CASCADE, related_name="accruals")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Сумма начисления")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name="Категория", null=True, blank=True)
    description = models.TextField(blank=True, verbose_name="Комментарий / описание")
    user_description = models.TextField(blank=True, verbose_name="Комментарий Пользователя")
    # year = models.CharField(max_length=4, verbose_name="Год начисления")
    # month = models.CharField(max_length=2, verbose_name="Месяц начисления")
    period = models.DateTimeField(verbose_name="Период начисления", null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True, verbose_name="Дата добавления")

    class Meta:
        verbose_name = "Начисление"
        verbose_name_plural = "Начисления"
        ordering = ["-date_created"]

    def __str__(self):
        return f"{self.dogowor.dogowor} - {self.get_category_display()}: {self.amount}"
    

class DogoworPayment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name="Добавил", on_delete=models.CASCADE, null=True, blank=True, related_name="dogowor_payments")
    dogowor = models.ForeignKey(UserDogowor, verbose_name="Договор", on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), verbose_name="Сумма платежа")
    payment_method = models.CharField(max_length=100, blank=True, verbose_name="Способ оплаты (касса, банк, онлайн и т.д.)")
    description = models.TextField(blank=True, verbose_name="Комментарий / описание")
    date = models.DateTimeField(verbose_name="Дата платежа")
    date_created = models.DateTimeField(auto_now_add=True, verbose_name="Когда добавлено в систему")

    class Meta:
        verbose_name = "Платёж"
        verbose_name_plural = "Платежи"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.dogowor.dogowor}: {self.amount} от {self.date.strftime('%d.%m.%Y')}"


class UserActionHistory(models.Model):
    ACTION_TYPES = [
        ("create", "Создание"),
        ("update", "Изменение"),
        ("delete", "Удаление"),
        ("import_excel", "Импорт из Excel"),
        ("export_excel", "Экспорт в Excel"),
        ("login", "Вход в систему"),
        ("logout", "Выход из системы"),
        ("other", "Другое"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name="Пользователь", on_delete=models.CASCADE, null=True, blank=True)
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES, verbose_name="Тип действия")
    model_name = models.CharField(max_length=100, blank=True, verbose_name="Модель / объект")
    object_id = models.CharField(max_length=100, blank=True, verbose_name="ID объекта")
    description = models.TextField(blank=True, verbose_name="Описание действия")
    file = models.FileField(upload_to="history_excel/", blank=True, null=True, verbose_name="Файл Excel")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата и время")

    class Meta:
        verbose_name = "История действий пользователя"
        verbose_name_plural = "История действий пользователей"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} — {self.get_action_type_display()} — {self.model_name} ({self.created_at.strftime('%d.%m.%Y %H:%M')})"


class Service(models.Model):
    service = models.CharField(max_length=1024, verbose_name='Услуга')
    price = models.FloatField(verbose_name='Цена')
    is_active = models.BooleanField(verbose_name='Активна', default=True)
    
    def __str__(self):
        return str(self.pk) + ': ' + self.service + ' :' + str(self.price) + 'м'

    class Meta:
        verbose_name = 'Услуга'  # В единственном числе
        verbose_name_plural = 'Услуги'
        

class UserService(models.Model):
    user = models.ForeignKey(UserTable, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    
    # Дополнительные поля для связи
    date_start = models.DateField(verbose_name='Дата подключения', auto_now_add=True)
    date_end = models.DateField(verbose_name='Дата отключения', blank=True, null=True)
    is_active = models.BooleanField(verbose_name='Активна', default=True)
    
    # Если цена услуги может меняться, сохраняем историческую цену
    actual_price = models.FloatField(verbose_name='Фактическая цена на момент подключения')
    
    # ⭐⭐⭐ НОВЫЕ ПОЛЯ ⭐⭐⭐
    connected_by = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name='Кто подключил', on_delete=models.SET_NULL, null=True, blank=True, related_name='connected_services'
    )
    comment = models.TextField(verbose_name='Комментарий', blank=True)
    date_connected = models.DateTimeField(verbose_name='Дата и время подключения', auto_now_add=True)
    
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name='Кто изменил', on_delete=models.SET_NULL, null=True, blank=True,related_name='updated_services')
    
    date_updated = models.DateTimeField(verbose_name='Дата и время изменения', auto_now=True)
    
    class Meta:
        verbose_name = 'Услуга абонента'
        verbose_name_plural = 'Услуги абонентов'
        unique_together = [['user', 'service']]
        ordering = ['-date_connected']  # Сортировка по дате подключения

    def __str__(self):
        return f"{self.user.number} - {self.service.service}"



