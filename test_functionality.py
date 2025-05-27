#!/usr/bin/env python
"""
Script para verificar que todas las funcionalidades del backend funcionan correctamente.

Este script prueba:
1. Conexión a la base de datos
2. Creación de usuarios
3. Creación de entrenamientos
4. Cálculo de estadísticas
5. Gestión de objetivos

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""

import os
import sys
import django
import datetime
from django.utils import timezone

def setup_django():
    """Configura Django para el script"""
    # Añadir el directorio backend al path
    backend_path = os.path.join(os.path.dirname(__file__), 'backend')
    sys.path.insert(0, backend_path)
    
    # Configurar Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'athcyl.settings')
    django.setup()

def test_database_connection():
    """Prueba la conexión a la base de datos"""
    print("🔍 Probando conexión a la base de datos...")
    
    try:
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        print("✅ Conexión a la base de datos exitosa")
        return True
    except Exception as e:
        print(f"❌ Error de conexión a la base de datos: {e}")
        return False

def test_user_creation():
    """Prueba la creación de usuarios"""
    print("\n👤 Probando creación de usuarios...")
    
    try:
        from users.models import User
        
        # Intentar crear un usuario de prueba
        test_email = "test@athcyl.com"
        
        # Eliminar usuario de prueba si existe
        User.objects.filter(email=test_email).delete()
        
        # Crear nuevo usuario
        user = User.objects.create_user(
            email=test_email,
            username="usuario_prueba",
            password="password123",
            first_name="Usuario",
            last_name="Prueba",
            weight=70.0,
            height=175.0
        )
        
        print(f"✅ Usuario creado: {user.email}")
        
        # Verificar que se puedan autenticar
        from django.contrib.auth import authenticate
        auth_user = authenticate(username=user.username, password="password123")
        
        if auth_user:
            print("✅ Autenticación de usuario exitosa")
        else:
            print("❌ Error en autenticación de usuario")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error creando usuario: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_training_creation():
    """Prueba la creación de entrenamientos"""
    print("\n🏃 Probando creación de entrenamientos...")
    
    try:
        from users.models import User
        from trainings.models import Training
        
        # Obtener usuario de prueba
        user = User.objects.filter(email="test@athcyl.com").first()
        if not user:
            print("❌ No se encontró usuario de prueba")
            return False
        
        # Crear entrenamiento de prueba
        training = Training.objects.create(
            user=user,
            title="Entrenamiento de Prueba",
            description="Entrenamiento creado por el script de verificación",
            activity_type="running",
            date=datetime.date.today(),
            start_time=datetime.time(8, 0),
            duration=datetime.timedelta(minutes=30),
            distance=5.0,
            avg_speed=10.0,
            calories=300
        )
        
        print(f"✅ Entrenamiento creado: {training.title}")
        
        # Verificar que se guardó correctamente
        saved_training = Training.objects.get(id=training.id)
        if saved_training.distance == 5.0:
            print("✅ Datos del entrenamiento guardados correctamente")
        else:
            print("❌ Error: datos del entrenamiento no coinciden")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error creando entrenamiento: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_stats_calculation():
    """Prueba el cálculo de estadísticas"""
    print("\n📊 Probando cálculo de estadísticas...")
    
    try:
        from users.models import User
        from stats.models import UserStats
        
        # Obtener usuario de prueba
        user = User.objects.filter(email="test@athcyl.com").first()
        if not user:
            print("❌ No se encontró usuario de prueba")
            return False
        
        # Obtener o crear estadísticas
        stats, created = UserStats.objects.get_or_create(user=user)
        
        if created:
            print("✅ Estadísticas de usuario creadas")
        else:
            print("✅ Estadísticas de usuario encontradas")
        
        # Actualizar estadísticas
        stats.update_stats()
        
        # Verificar que las estadísticas se calcularon
        if stats.total_trainings > 0:
            print(f"✅ Estadísticas calculadas: {stats.total_trainings} entrenamientos, {stats.total_distance} km")
        else:
            print("❌ Error: estadísticas no se calcularon correctamente")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error calculando estadísticas: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_goal_creation():
    """Prueba la creación de objetivos"""
    print("\n🎯 Probando creación de objetivos...")
    
    try:
        from users.models import User
        from trainings.models import Goal
        
        # Obtener usuario de prueba
        user = User.objects.filter(email="test@athcyl.com").first()
        if not user:
            print("❌ No se encontró usuario de prueba")
            return False
        
        # Crear objetivo de prueba
        goal = Goal.objects.create(
            user=user,
            title="Correr 10km por semana",
            description="Objetivo de prueba",
            goal_type="distance",
            target_value=10.0,
            period="weekly",
            start_date=datetime.date.today()
        )
        
        print(f"✅ Objetivo creado: {goal.title}")
        
        # Verificar que se guardó correctamente
        saved_goal = Goal.objects.get(id=goal.id)
        if saved_goal.target_value == 10.0:
            print("✅ Datos del objetivo guardados correctamente")
        else:
            print("❌ Error: datos del objetivo no coinciden")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error creando objetivo: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_endpoints():
    """Prueba los endpoints básicos de la API"""
    print("\n🌐 Probando endpoints de la API...")
    
    try:
        from django.test import Client
        from django.contrib.auth import get_user_model
        
        client = Client()
        User = get_user_model()
        
        # Obtener usuario de prueba
        user = User.objects.filter(email="test@athcyl.com").first()
        if not user:
            print("❌ No se encontró usuario de prueba")
            return False
        
        # Probar login
        login_data = {
            'username_or_email': user.email,
            'password': 'password123'
        }
        
        response = client.post('/api/token/', login_data, content_type='application/json')
        
        if response.status_code == 200:
            print("✅ Endpoint de login funciona correctamente")
        else:
            print(f"❌ Error en endpoint de login: {response.status_code}")
            print(f"   Respuesta: {response.content}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error probando API: {e}")
        import traceback
        traceback.print_exc()
        return False

def cleanup_test_data():
    """Limpia los datos de prueba"""
    print("\n🧹 Limpiando datos de prueba...")
    
    try:
        from users.models import User
        
        # Eliminar usuario de prueba (esto eliminará en cascada todos sus datos)
        User.objects.filter(email="test@athcyl.com").delete()
        print("✅ Datos de prueba eliminados")
        
    except Exception as e:
        print(f"⚠️ Error limpiando datos de prueba: {e}")

def check_tables():
    """Verifica que las tablas tengan los nombres en español"""
    print("\n📋 Verificando nombres de tablas...")
    
    try:
        from django.db import connection
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name IN (
                'usuarios', 'entrenamientos', 'puntos_ruta', 'objetivos', 
                'estadisticas_usuario', 'resumenes_actividad'
            )
            ORDER BY table_name
        """)
        
        tablas_esperadas = cursor.fetchall()
        
        if tablas_esperadas:
            print("✅ Tablas con nombres en español encontradas:")
            for tabla in tablas_esperadas:
                print(f"   - {tabla[0]}")
        else:
            print("❌ No se encontraron tablas con nombres en español")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error verificando tablas: {e}")
        return False

def main():
    """Función principal del script"""
    print("🧪 VERIFICACIÓN DE FUNCIONALIDADES ATHCYL")
    print("=" * 50)
    
    # Configurar Django
    setup_django()
    
    # Lista de pruebas
    tests = [
        ("Conexión a base de datos", test_database_connection),
        ("Nombres de tablas", check_tables),
        ("Creación de usuarios", test_user_creation),
        ("Creación de entrenamientos", test_training_creation),
        ("Cálculo de estadísticas", test_stats_calculation),
        ("Creación de objetivos", test_goal_creation),
        ("Endpoints de API", test_api_endpoints),
    ]
    
    # Ejecutar pruebas
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
            if not result:
                print(f"\n⚠️ La prueba '{test_name}' falló. Continuando con las demás...")
        except Exception as e:
            print(f"\n💥 Error inesperado en '{test_name}': {e}")
            results.append((test_name, False))
    
    # Limpiar datos de prueba
    cleanup_test_data()
    
    # Mostrar resumen
    print("\n" + "=" * 50)
    print("📋 RESUMEN DE PRUEBAS")
    print("=" * 50)
    
    passed = 0
    failed = 0
    
    for test_name, result in results:
        status = "✅ EXITOSA" if result else "❌ FALLIDA"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\n🎯 Total: {passed} exitosas, {failed} fallidas")
    
    if failed == 0:
        print("\n🎉 ¡Todas las pruebas pasaron! El backend está funcionando correctamente.")
        return True
    else:
        print(f"\n⚠️ {failed} pruebas fallaron. Revisa los errores anteriores.")
        return False

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️ Verificación cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n💥 Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)