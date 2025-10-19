from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.db import IntegrityError
import os

User = get_user_model()


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
                    password=password,  # ИЗМЕНИТЕ НА БЕЗОПАСНЫЙ!
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
            'Administrators': {
                'description': 'Full system access',
                'permissions': []  # Все права будут назначены вручную
            },
            'Dashoguz_kassa': {
                'description': 'Manage users and billing',
                'permissions': []
            },
        }

        for group_name, config in groups_config.items():
            try:
                group, created = Group.objects.get_or_create(name=group_name)
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Group "{group_name}" created')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'✗ Group "{group_name}" already exists')
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Error creating group {group_name}: {e}')
                )

        # Добавить админа в группу Administrators
        try:
            admin_user = User.objects.get(username=username)
            admin_group = Group.objects.get(name='Administrators')
            admin_user.groups.add(admin_group)
            self.stdout.write(
                self.style.SUCCESS('✓ Admin added to Administrators group')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Error adding admin to group: {e}')
            )

        self.stdout.write(
            self.style.SUCCESS('\n=== Setup completed successfully ===')
        )