from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.db import IntegrityError
import os
from core.models import Etrap

User = get_user_model()

ETRAPS = {
    "Dashoguz": "322",
    "Akdepe": "344",
    "Boldumsaz": "346",
    "Gorogly": "340",
    "Gubadag": "345",
    "Garashsyzlyk": "343",
    "Koneurgench": "347",
    "Turkmenbashy": "349",
    "Shabat": "348",
    "Ruhubelent": "342",
}


class Command(BaseCommand):
    help = 'Create initial superuser and groups'

    def handle(self, *args, **options):
        # Создание суперпользователя
        username = os.getenv('DJANGO_SUPERUSER_USERNAME')
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD')
        
        try:
            if not User.objects.filter(username=username).exists():
                User.objects.create_superuser(
                    username=username,
                    password=password,
                    first_name='Anvar',
                    last_name='Sharipov'
                )
                self.stdout.write(
                    self.style.SUCCESS('✓ Superuser "admin" created')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('✗ Superuser "admin" already exists')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Error creating superuser: {e}')
            )

        # Создание групп
        groups_config = {
            'admin': {
                'description': 'Full system access',
                'permissions': []
            },
            'AMTC_access': {
                'description': 'AMTS code access',
                'permissions': []
            },
            'viewer': {
                'description': 'View only access',
                'permissions': []
            },
        }
        
        # Добавляем группы по всем этрапам
        for etrap_name in ETRAPS.keys():
            groups_config[etrap_name] = {
                'description': f'{etrap_name} operators',
                'permissions': []
            }

        for group_name, config in groups_config.items():
            try:
                group, created = Group.objects.get_or_create(
                    name=group_name,
                    defaults={'description': config['description']}
                )
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Group "{group_name}" created')
                    )
                else:
                    # Обновляем описание если группа уже существует
                    if group.description != config['description']:
                        group.description = config['description']
                        group.save()
                    self.stdout.write(
                        self.style.WARNING(f'✗ Group "{group_name}" already exists')
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Error creating group {group_name}: {e}')
                )

        # Добавить админа в группу admin (теперь используем 'admin' вместо 'Administrators')
        try:
            admin_user = User.objects.get(username=username)
            admin_group = Group.objects.get(name='admin')  # Изменено на 'admin'
            admin_user.groups.add(admin_group)
            self.stdout.write(
                self.style.SUCCESS('✓ Admin added to admin group')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Error adding admin to group: {e}')
            )

        
        # --- Etraps ---
        for etrap_name, code in ETRAPS.items():
            try:
                etrap, created = Etrap.objects.get_or_create(
                    code=code,
                    defaults={'etrap': etrap_name, 'is_active': True}
                )
                if not created:
                    # Если этрап уже есть — активируем
                    etrap.is_active = True
                    etrap.save()
                    self.stdout.write(self.style.WARNING(f'⚠ Etrap "{etrap_name}" updated to active'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'✓ Etrap "{etrap_name}" created'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Error creating etrap {etrap_name}: {e}'))

        self.stdout.write(self.style.SUCCESS('\n=== Setup completed successfully ==='))