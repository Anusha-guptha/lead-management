from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet, LeadNoteViewSet

router = DefaultRouter()
router.register('leads', LeadViewSet, basename='lead')
router.register('notes', LeadNoteViewSet, basename='note')

urlpatterns = [
    path('', include(router.urls)),
]
