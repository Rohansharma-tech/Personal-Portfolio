from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from rest_framework.exceptions import Throttled
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import Profile, Skill, Education, Certification, Project, ProjectScreenshot, ContactMessage
from .serializers import (
    ProfileSerializer, SkillSerializer, EducationSerializer,
    CertificationSerializer, ProjectSerializer, ProjectScreenshotSerializer,
    ContactMessageSerializer, ContactMessageCreateSerializer, DashboardStatsSerializer
)
from .throttles import ContactBurstThrottle, ContactSustainThrottle


class _ThrottleResponse(Exception):
    """Sentinel used by ContactCreateView.throttled() to short-circuit DRF
    and return a pre-built JsonResponse with custom 429 body."""
    def __init__(self, response):
        self.response = response



# ─── Profile ────────────────────────────────────────────────────────────────

class ProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        profile = Profile.objects.first()
        if not profile:
            return Response({})
        return Response(ProfileSerializer(profile, context={'request': request}).data)


class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def put(self, request):
        profile, _ = Profile.objects.get_or_create(pk=1)
        serializer = ProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        return self.put(request)


# ─── Skills ─────────────────────────────────────────────────────────────────

class SkillListCreateView(generics.ListCreateAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]


class SkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]


# ─── Education ──────────────────────────────────────────────────────────────

class EducationListCreateView(generics.ListCreateAPIView):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]


class EducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated]


# ─── Certifications ──────────────────────────────────────────────────────────

class CertificationListCreateView(generics.ListCreateAPIView):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]


class CertificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]


# ─── Projects ────────────────────────────────────────────────────────────────

class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        featured = self.request.query_params.get('featured')
        status_filter = self.request.query_params.get('status')
        if featured == 'true':
            qs = qs.filter(is_featured=True)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class ProjectScreenshotCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, project_id):
        project = get_object_or_404(Project, pk=project_id)
        images = request.FILES.getlist('images')
        screenshots = []
        for i, img in enumerate(images):
            ss = ProjectScreenshot.objects.create(project=project, image=img, order=i)
            screenshots.append(ProjectScreenshotSerializer(ss).data)
        return Response(screenshots, status=status.HTTP_201_CREATED)

    def delete(self, request, project_id):
        screenshot_id = request.data.get('screenshot_id')
        ss = get_object_or_404(ProjectScreenshot, pk=screenshot_id, project_id=project_id)
        ss.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Contact ─────────────────────────────────────────────────────────────────

class ContactCreateView(generics.CreateAPIView):
    """
    POST /api/contact/

    Rate limits (per IP address):
      - Burst  : 2 requests / minute  — prevents double-submits & rapid flooding
      - Sustain: 5 requests / hour    — prevents sustained spam campaigns

    On limit hit → HTTP 429 with JSON body:
      { "error": "rate_limited", "message": "...", "retry_after": <seconds> }
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageCreateSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ContactBurstThrottle, ContactSustainThrottle]

    def throttled(self, request, wait):
        """Return a rich 429 body the frontend can use to show a countdown."""
        wait_seconds = int(wait) + 1  # round up so UI countdown is accurate
        if wait_seconds <= 60:
            message = f'Too many requests. Please wait {wait_seconds} seconds before trying again.'
        else:
            minutes = round(wait_seconds / 60)
            message = f'Too many messages sent. Please wait {minutes} minute{"s" if minutes > 1 else ""} before trying again.'

        response = JsonResponse({
            'error': 'rate_limited',
            'message': message,
            'retry_after': wait_seconds,
        }, status=429)
        response['Retry-After'] = str(wait_seconds)
        raise _ThrottleResponse(response)

    def handle_exception(self, exc):
        """Intercept our sentinel and return its pre-built response."""
        if isinstance(exc, _ThrottleResponse):
            return exc.response
        return super().handle_exception(exc)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'success': True, 'message': 'Message sent successfully!'},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContactMessageListView(generics.ListAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAuthenticated]


class ContactMessageDetailView(generics.RetrieveDestroyAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAuthenticated]


class MarkMessageReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        msg = get_object_or_404(ContactMessage, pk=pk)
        msg.is_read = True
        msg.save()
        return Response({'success': True})


# ─── Dashboard Stats ─────────────────────────────────────────────────────────

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = {
            'total_projects': Project.objects.count(),
            'total_certifications': Certification.objects.count(),
            'total_skills': Skill.objects.count(),
            'total_education': Education.objects.count(),
            'total_messages': ContactMessage.objects.count(),
            'unread_messages': ContactMessage.objects.filter(is_read=False).count(),
        }
        return Response(data)
