import os
from django.core.management import execute_from_command_line

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'athcyl.settings')

# Ejecutar Django
code = """from django.contrib.auth import get_user_model\nUser = get_user_model()\ntry:\n    user = User.objects.get(email='juanma.ordas@gmail.com')\n    print('\n=== Información del Usuario ===')\n    print('Username:', user.username)\n    print('Email:', user.email)\n    print('Is Active:', user.is_active)\n    print('Is Staff:', user.is_staff)\n    print('Is Superuser:', user.is_superuser)\nexcept User.DoesNotExist:\n    print('❌ Usuario no encontrado')"""
execute_from_command_line(['manage.py', 'shell', '-c', code])
