from django.contrib import admin
from .models import *

# ---------- Etrap ----------
@admin.register(Etrap)
class EtrapAdmin(admin.ModelAdmin):
    list_display = ('etrap', 'code', 'is_active')
    search_fields = ('etrap', 'code')
    ordering = ('etrap',)

# ---------- UserTable ----------
@admin.register(UserTable)
class UserTableAdmin(admin.ModelAdmin):
    list_display = ('number', 'etrap', 'name', 'hb_type', 'is_active', 'is_enterprises', 'account')
    list_filter = ('etrap', 'hb_type', 'is_active', 'is_enterprises')
    search_fields = ('number', 'name', 'address', 'mobile_number')  # ИСПРАВЛЕНО: sotowyy -> mobile_number
    ordering = ('-number',)
    fieldsets = (
        (None, {
            'fields': ('number', 'etrap', 'is_active')
        }),
        ('Основная информация', {
            'fields': ('surname', 'name', 'patronymic', 'address', 'mobile_number')
        }),
        ('Тип и дополнительные данные', {
            'fields': ('is_enterprises', 'hb_type', 'account')
        }),
    )

# ---------- Inline для Dogowor ----------
class DogoworBalanceInline(admin.StackedInline):
    model = DogoworBalance
    extra = 0
    readonly_fields = ('amount',)



class DogoworAccrualInline(admin.TabularInline):
    model = DogoworAccrual
    extra = 0
    readonly_fields = ('amount', 'category', 'year', 'month', 'description', 'date_created')

class DogoworPaymentInline(admin.TabularInline):
    model = DogoworPayment
    extra = 0
    readonly_fields = ('amount', 'payment_method', 'description', 'date', 'user', 'date_created')


# ---------- UserDogowor ----------
@admin.register(UserDogowor)
class UserDogoworAdmin(admin.ModelAdmin):
    list_display = ('dogowor', 'user', 'balance_type', "comment")
    list_filter = ('balance_type',)
    search_fields = ('dogowor', 'user__number', 'user__name', "comment")
    inlines = [DogoworBalanceInline, DogoworAccrualInline, DogoworPaymentInline]
    ordering = ('dogowor',)

# ---------- AccrualCategory ----------
@admin.register(AccrualCategory)
class AccrualCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

# ---------- DogoworAccrual ----------
@admin.register(DogoworAccrual)
class DogoworAccrualAdmin(admin.ModelAdmin):
    list_display = ('dogowor', 'amount', 'category', 'year', 'month', 'date_created')
    list_filter = ('year', 'month', 'category')
    search_fields = ('dogowor__dogowor',)

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
