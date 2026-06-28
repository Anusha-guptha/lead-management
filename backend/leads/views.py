from django.db.models import Count
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import Lead, LeadNote
from .serializers import LeadSerializer, LeadNoteSerializer
from .email_utils import notify_new_lead

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'company', 'phone']

    def get_queryset(self):
        qs = Lead.objects.all()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    def perform_create(self, serializer):
        lead = serializer.save(owner=self.request.user)
        notify_new_lead(lead)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        qs = Lead.objects.all()
        total = qs.count()
        by_status = list(qs.values('status').annotate(count=Count('id')))
        recent = qs.order_by('-created_at')[:5]
        return Response({
            'total_leads': total,
            'by_status': by_status,
            'recent_leads': LeadSerializer(recent, many=True).data,
        })


class LeadNoteViewSet(viewsets.ModelViewSet):
    serializer_class = LeadNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = LeadNote.objects.all()
        lead_id = self.request.query_params.get('lead')
        if lead_id:
            qs = qs.filter(lead_id=lead_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            raise PermissionDenied("You can only edit your own notes.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied("You can only delete your own notes.")
        instance.delete()