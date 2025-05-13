from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StatsViewSet, ActivitySummaryViewSet

router = DefaultRouter()
router.register(r'user-stats', StatsViewSet, basename='user-stats')
router.register(r'activity-summaries', ActivitySummaryViewSet, basename='activity-summaries')

urlpatterns = [
    path('', include(router.urls)),
]
