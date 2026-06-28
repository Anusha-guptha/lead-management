from django.contrib import admin
from .models import Lead, LeadNote


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'company', 'status', 'owner', 'created_at']
    list_filter = ['status']
    search_fields = ['name', 'email', 'company']


@admin.register(LeadNote)
class LeadNoteAdmin(admin.ModelAdmin):
    list_display = ['lead', 'author', 'created_at']
