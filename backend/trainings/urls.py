from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainingViewSet, GoalViewSet

router = DefaultRouter()
router.register(r'trainings', TrainingViewSet, basename='training')
router.register(r'goals', GoalViewSet, basename='goal')

urlpatterns = [
    path('', include(router.urls)),
]
