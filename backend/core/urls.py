# core/urls.py
from django.urls import path
from . import views
from . import views2
from . import views3
from . import views_test

from rest_framework.routers import DefaultRouter
from .views import EtrapViewSet

router = DefaultRouter()
router.register(r'etraps', EtrapViewSet)

urlpatterns = [
    path('users/upload-from-excel/', views.upload_users_from_excel, name='upload-users-excel'),
    path('save-abonent/', views.save_abonent, name='save-abonent'),
    # path('update-abonent/', views.update_abonent, name='update-abonent'),
    
    
    # get
    path('checkActiveOrNot/', views2.checkActiveOrNot, name='checkActiveOrNot'),
    path('checkUniqueDogowor/', views2.checkUniqueDogowor, name='checkUniqueDogowor'),
    path('checkUniqueLogin/', views2.checkUniqueLogin, name='checkUniqueLogin'),
    path('get-filtered-users/', views2.get_filtered_users, name='get_filtered_users'),
    path('get-user-for-update-telefoniya/', views2.get_user_for_update_telefoniya, name='get-user-for-update-telefoniya'),
    path('get-all-services/', views2.get_all_services, name='get-all-services'),
    path('export-users/', views2.export_users, name='export_users'),
    
    # path('users/<int:user_id>/dogowor/new/', views.add_dogowor_view, name='add-dogowor'),
    path('users/<int:user_id>/', views.get_user, name='get_user'),
    path('get-user-history/', views3.get_user_history, name='get-user-history'),
    path('get_user_for_kassa/<int:user_id>/', views3.get_user_for_kassa, name='get_user_for_kassa'),
    
    

    path('users/<int:user_id>/save-dogowor/', views.save_dogowor, name='save_dogowor'),
    
    
    # test
    path('create-200-test-users/', views_test.create_200_test_users, name='create-200-test-users'),
    path('getLatesEmptyNumber4Stansion/', views_test.getLatesEmptyNumber4Stansion, name='getLatesEmptyNumber4Stansion'),
    
]


urlpatterns += router.urls