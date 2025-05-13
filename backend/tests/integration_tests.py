import os
import sys
import django
import unittest
import json
from datetime import datetime, timedelta

# Configurar entorno Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'athcyl.settings')
django.setup()

from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from users.models import User
from trainings.models import Training, Goal
from stats.models import UserStats, ActivitySummary

class AthCylIntegrationTests(TestCase):
    """Pruebas de integración para la aplicación AthCyl"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.client = APIClient()
        
        # Crear un usuario de prueba
        self.test_user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpassword123',
            first_name='Test',
            last_name='User',
            height=175,
            weight=70
        )
        
        # Autenticar al usuario
        self.client.force_authenticate(user=self.test_user)
        
        # Crear un entrenamiento de prueba
        self.test_training = Training.objects.create(
            user=self.test_user,
            title='Test Training',
            description='This is a test training',
            activity_type='running',
            date=datetime.now().date(),
            start_time=datetime.now().time(),
            duration=timedelta(minutes=30),
            distance=5.0,
            avg_speed=10.0,
            max_speed=12.0,
            calories=300
        )
        
        # Crear un objetivo de prueba
        self.test_goal = Goal.objects.create(
            user=self.test_user,
            title='Test Goal',
            description='This is a test goal',
            goal_type='distance',
            target_value=100.0,
            period='weekly',
            start_date=datetime.now().date(),
            end_date=(datetime.now() + timedelta(days=7)).date()
        )
        
        # Asegurarse de que existan estadísticas para el usuario
        self.user_stats, created = UserStats.objects.get_or_create(user=self.test_user)
        if created:
            self.user_stats.update_stats()
    
    def test_user_authentication(self):
        """Prueba la autenticación de usuarios"""
        # Cerrar sesión primero
        self.client.force_authenticate(user=None)
        
        # Intentar iniciar sesión con credenciales incorrectas
        response = self.client.post('/api/users/login/', {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Iniciar sesión con credenciales correctas
        response = self.client.post('/api/users/login/', {
            'email': 'test@example.com',
            'password': 'testpassword123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
    
    def test_training_crud(self):
        """Prueba las operaciones CRUD para entrenamientos"""
        # Listar entrenamientos
        response = self.client.get('/api/trainings/trainings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        
        # Obtener un entrenamiento específico
        response = self.client.get(f'/api/trainings/trainings/{self.test_training.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Training')
        
        # Crear un nuevo entrenamiento
        new_training_data = {
            'title': 'New Training',
            'description': 'This is a new training',
            'activity_type': 'cycling',
            'date': datetime.now().date().isoformat(),
            'start_time': datetime.now().time().isoformat(),
            'duration': '00:45:00',
            'distance': 15.0,
            'avg_speed': 20.0,
            'max_speed': 25.0,
            'calories': 450
        }
        
        response = self.client.post('/api/trainings/trainings/', new_training_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Actualizar un entrenamiento
        update_data = {'title': 'Updated Training'}
        response = self.client.patch(f'/api/trainings/trainings/{self.test_training.id}/', update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Training')
        
        # Eliminar un entrenamiento
        response = self.client.delete(f'/api/trainings/trainings/{self.test_training.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verificar que se haya eliminado
        response = self.client.get(f'/api/trainings/trainings/{self.test_training.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_goal_crud(self):
        """Prueba las operaciones CRUD para objetivos"""
        # Listar objetivos
        response = self.client.get('/api/trainings/goals/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        
        # Obtener un objetivo específico
        response = self.client.get(f'/api/trainings/goals/{self.test_goal.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Goal')
        
        # Crear un nuevo objetivo
        new_goal_data = {
            'title': 'New Goal',
            'description': 'This is a new goal',
            'goal_type': 'frequency',
            'target_value': 10.0,
            'period': 'monthly',
            'start_date': datetime.now().date().isoformat(),
            'end_date': (datetime.now() + timedelta(days=30)).date().isoformat()
        }
        
        response = self.client.post('/api/trainings/goals/', new_goal_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Actualizar un objetivo
        update_data = {'title': 'Updated Goal'}
        response = self.client.patch(f'/api/trainings/goals/{self.test_goal.id}/', update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Goal')
        
        # Marcar un objetivo como completado
        complete_data = {'is_completed': True}
        response = self.client.patch(f'/api/trainings/goals/{self.test_goal.id}/', complete_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_completed'])
        
        # Eliminar un objetivo
        response = self.client.delete(f'/api/trainings/goals/{self.test_goal.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verificar que se haya eliminado
        response = self.client.get(f'/api/trainings/goals/{self.test_goal.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_stats_endpoints(self):
        """Prueba los endpoints de estadísticas"""
        # Obtener estadísticas del usuario
        response = self.client.get('/api/stats/user-stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Obtener resumen de actividad
        response = self.client.get('/api/stats/activity-summary/weekly/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Forzar actualización de estadísticas
        response = self.client.post('/api/stats/user-stats/update/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_profile_update(self):
        """Prueba la actualización del perfil de usuario"""
        # Obtener perfil actual
        response = self.client.get('/api/users/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Actualizar perfil
        update_data = {
            'first_name': 'Updated',
            'last_name': 'User',
            'height': 180,
            'weight': 75
        }
        
        response = self.client.patch('/api/users/profile/', update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Updated')
        self.assertEqual(response.data['height'], 180)

if __name__ == '__main__':
    unittest.main()
