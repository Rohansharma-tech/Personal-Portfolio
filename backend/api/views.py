from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Profile, Skill, Education, Certification, Project, ProjectScreenshot, ContactMessage
from .serializers import (
    ProfileSerializer, SkillSerializer, EducationSerializer,
    CertificationSerializer, ProjectSerializer, ProjectScreenshotSerializer,
    ContactMessageSerializer, ContactMessageCreateSerializer, DashboardStatsSerializer
)


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
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageCreateSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Message sent successfully!'}, status=status.HTTP_201_CREATED)
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
