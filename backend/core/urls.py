# core/urls.py
from django.urls import path
from . import views
from . import views2

from rest_framework.routers import DefaultRouter
from .views import EtrapViewSet

router = DefaultRouter()
router.register(r'etraps', EtrapViewSet)

urlpatterns = [
    path('users/upload-from-excel/', views.upload_users_from_excel, name='upload-users-excel'),
    path('create-abonent/', views.create_abonent, name='create-abonent'),
    
    
    # get
    path('checkActiveOrNot/', views2.checkActiveOrNot, name='checkActiveOrNot'),
    path('checkUniqueDogowor/', views2.checkUniqueDogowor, name='checkUniqueDogowor'),
    path('get-filtered-users/', views2.get_filtered_users, name='get_filtered_users'),
]


urlpatterns += router.urls