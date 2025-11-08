from django.contrib import admin
from .models import *

from django.utils.html import format_html
from django.utils import timezone
from datetime import datetime

# ---------- Etrap ----------
@admin.register(Etrap)
class EtrapAdmin(admin.ModelAdmin):
    list_display = ('etrap', 'code', 'is_active')
    search_fields = ('etrap', 'code')
    ordering = ('etrap',)


# ---------- Service ----------
@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('service', 'price', 'display_price')
    list_filter = ('price',)
    search_fields = ('service',)
    ordering = ('service',)
    
    def display_price(self, obj):
        return f"{obj.price} ман."
    display_price.short_description = 'Цена'
    
    fieldsets = (
        (None, {
            'fields': ('service', 'price')
        }),
    )
    
    
# ---------- UserService (промежуточная модель) ----------
@admin.register(UserService)
class UserServiceAdmin(admin.ModelAdmin):
    list_display = ('user', 'service', 'date_start', 'date_end', 'is_active', 
                   'display_actual_price', 'connected_by', 'date_connected')
    list_filter = ('is_active', 'date_start', 'service', 'connected_by')
    search_fields = ('user__number', 'user__name', 'service__service', 'comment')
    list_editable = ('is_active', 'date_end')
    date_hierarchy = 'date_connected'
    readonly_fields = ('date_start', 'date_connected', 'date_updated', 'updated_by')
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'service', 'is_active')
        }),
        ('Цены и даты', {
            'fields': ('actual_price', 'date_end')
        }),
        ('История подключения', {
            'fields': ('connected_by', 'date_connected', 'updated_by', 'date_updated')
        }),
        ('Дополнительно', {
            'fields': ('comment',)
        }),
    )
    
    def display_actual_price(self, obj):
        return f"{obj.actual_price} ман."
    display_actual_price.short_description = 'Фактическая цена'
    
    def save_model(self, request, obj, form, change):
        """Автоматически сохраняем кто изменил запись"""
        if change:
            obj.updated_by = request.user
        else:
            obj.connected_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(UserTable)
class UserTableAdmin(admin.ModelAdmin):
    list_display = ('number', 'etrap', 'name', 'hb_type', 'is_enterprises', 'account', 'display_abonplata', 'display_services_count')
    list_filter = ('etrap', 'hb_type', 'is_enterprises')
    search_fields = ('number', 'name', 'surname', 'address', 'mobile_number')
    ordering = ('-number',)
    readonly_fields = ('display_active_services',)
    
    fieldsets = (
        (None, {
            'fields': ('number', 'etrap')
        }),
        ('Основная информация', {
            'fields': ('surname', 'name', 'patronymic', 'address', 'mobile_number')
        }),
        ('Тип и дополнительные данные', {
            'fields': ('is_enterprises', 'hb_type', 'account', 'abonplata')
        }),
        ('Услуги', {
            'fields': ('display_active_services',)
        }),
    )
    
    def display_abonplata(self, obj):
        """Красиво отображает абонплату с валютой"""
        return f"{obj.abonplata} ман." if obj.abonplata else "0 ман."
    display_abonplata.short_description = 'Абонплата'
    display_abonplata.admin_order_field = 'abonplata'
    
    def display_services_count(self, obj):
        """Показывает количество активных услуг"""
        count = obj.userservice_set.filter(is_active=True).count()
        return f"{count} услуг"
    display_services_count.short_description = 'Активных услуг'
    
    def display_active_services(self, obj):
        """Показывает список активных услуг в админке"""
        active_services = obj.userservice_set.filter(is_active=True)
        if active_services:
            services_list = []
            for us in active_services:
                services_list.append(
                    f"• {us.service.service} ({us.actual_price} ман.) - с {us.date_start}"
                )
            return "\n".join(services_list)
        return "Нет активных услуг"
    display_active_services.short_description = 'Активные услуги'
    
    class UserServiceInline(admin.TabularInline):
        model = UserService
        extra = 1
        fields = ('service', 'actual_price', 'date_end', 'is_active', 'connected_by', 'comment')
        readonly_fields = ('date_connected', 'date_updated')
        verbose_name = 'Подключенная услуга'
        verbose_name_plural = 'Подключенные услуги'
        
        def get_formset(self, request, obj=None, **kwargs):
            formset = super().get_formset(request, obj, **kwargs)
            formset.request = request
            return formset
        
        def save_formset(self, request, form, formset, change):
            instances = formset.save(commit=False)
            for instance in instances:
                if not instance.pk:
                    instance.connected_by = request.user
                else:
                    instance.updated_by = request.user
                instance.save()
            formset.save_m2m()
    
    inlines = [UserServiceInline]

# ---------- Inline для Dogowor ----------
class DogoworBalanceInline(admin.StackedInline):
    model = DogoworBalance
    extra = 0
    readonly_fields = ('amount',)


class DogoworAccrualInline(admin.TabularInline):
    model = DogoworAccrual
    extra = 0
    readonly_fields = ('amount', 'category', 'period', 'description', 'date_created')


class DogoworPaymentInline(admin.TabularInline):
    model = DogoworPayment
    extra = 0
    readonly_fields = ('amount', 'payment_method', 'description', 'date', 'user', 'date_created')


# ---------- UserDogowor ----------
@admin.register(UserDogowor)
class UserDogoworAdmin(admin.ModelAdmin):
    list_display = ('dogowor', 'user', 'balance_type', 'login', 'comment')
    list_filter = ('balance_type',)
    search_fields = ('dogowor', 'user__number', 'user__name', 'comment', 'login')
    inlines = [DogoworBalanceInline, DogoworAccrualInline, DogoworPaymentInline]
    ordering = ('dogowor',)
    
    fieldsets = (
        (None, {
            'fields': ('user', 'dogowor', 'login', 'balance_type')
        }),
        ('Даты', {
            'fields': ('activate_at', 'deactivate_at')
        }),
        ('Дополнительно', {
            'fields': ('comment',)
        }),
    )


# ⭐⭐⭐ УБИРАЕМ AccrualCategoryAdmin ⭐⭐⭐
# @admin.register(AccrualCategory)
# class AccrualCategoryAdmin(admin.ModelAdmin):
#     list_display = ('name',)
#     search_fields = ('name',)


# ---------- DogoworAccrual ----------
# @admin.register(DogoworAccrual)
# class DogoworAccrualAdmin(admin.ModelAdmin):
#     list_display = ('dogowor', 'amount', 'get_category_display', 'period', 'date_created')
#     list_filter = ('category', 'period')
#     search_fields = ('dogowor__dogowor', 'description')

#     def get_category_display(self, obj):
#         return obj.get_category_display()
#     get_category_display.short_description = 'Категория'
@admin.register(DogoworAccrual)
class DogoworAccrualAdmin(admin.ModelAdmin):
    # какие поля показываем в списке
    list_display = (
        'dogowor_link',
        'display_category',
        'display_amount',
        'display_period',
        'description_short',
        'date_created',
    )

    # фильтры справа
    list_filter = (
        'category',
        ('period', admin.DateFieldListFilter),
        ('date_created', admin.DateFieldListFilter),
    )

    # поиск
    search_fields = (
        'dogowor__dogowor',
        'dogowor__user__name',
        'dogowor__user__number',
        'description',
    )

    # сортировка
    ordering = ('-date_created',)

    # количество записей на странице
    list_per_page = 30

    # поля, доступные только для чтения
    readonly_fields = ('date_created',)

    fieldsets = (
        ('Основная информация', {
            'fields': ('dogowor', 'category', 'amount', 'period'),
        }),
        ('Описание', {
            'fields': ('description',),
        }),
        ('Служебные данные', {
            'fields': ('date_created',),
        }),
    )

    # --- КРАСИВОЕ ОТОБРАЖЕНИЕ ---
    def dogowor_link(self, obj):
        """Показывает договор с ссылкой"""
        return format_html(
            '<a href="/admin/core/userdogowor/{}/change/">{}</a>',
            obj.dogowor.id,
            obj.dogowor.dogowor
        )
    dogowor_link.short_description = "Договор"

    def display_amount(self, obj):
        color = "green" if obj.amount >= 0 else "red"
        return format_html(
            '<b style="color:{};">{} ман.</b>',
            color,
            f"{obj.amount:.2f}"
        )
    display_amount.short_description = "Сумма"

    def display_category(self, obj):
        """Показывает категорию в читаемом виде"""
        return obj.get_category_display()
    display_category.short_description = "Категория"

    def display_period(self, obj):
        """Показывает дату начисления красиво"""
        return obj.period.strftime("%d.%m.%Y %H:%M") if obj.period else "-"
    display_period.short_description = "Период начисления"

    def description_short(self, obj):
        """Сокращает длинное описание"""
        if not obj.description:
            return "-"
        text = obj.description
        return (text[:50] + "…") if len(text) > 50 else text
    description_short.short_description = "Комментарий"

    # --- ДОПОЛНИТЕЛЬНО ---
    def get_queryset(self, request):
        """Оптимизация: загружаем связанные данные"""
        qs = super().get_queryset(request)
        return qs.select_related('dogowor', 'dogowor__user')


# ---------- DogoworPayment ----------
@admin.register(DogoworPayment)
class DogoworPaymentAdmin(admin.ModelAdmin):
    list_display = ('dogowor', 'amount', 'payment_method', 'date', 'user')
    list_filter = ('payment_method', 'date')
    search_fields = ('dogowor__dogowor', 'user__username')


# ---------- UserActionHistory ----------
@admin.register(UserActionHistory)
class UserActionHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'action_type', 'model_name', 'object_id', 'created_at')
    list_filter = ('action_type', 'created_at')
    search_fields = ('user__username', 'model_name', 'object_id')
    readonly_fields = ('user', 'action_type', 'model_name', 'object_id', 'description', 'file', 'created_at')