from rest_framework import serializers
from .models import Lead, LeadNote


class LeadNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = LeadNote
        fields = ['id', 'lead', 'author', 'author_name', 'content', 'created_at']
        read_only_fields = ['author', 'created_at']


class LeadSerializer(serializers.ModelSerializer):
    notes = LeadNoteSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'email', 'phone', 'company', 'status',
            'owner', 'owner_name', 'created_at', 'updated_at', 'notes',
        ]
        read_only_fields = ['owner', 'created_at', 'updated_at']