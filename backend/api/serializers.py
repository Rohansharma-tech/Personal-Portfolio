from rest_framework import serializers
from .models import Profile, Skill, Education, Certification, Project, ProjectScreenshot, ContactMessage


def get_file_url(request, field_value):
    """Return absolute URL for a file field, or empty string."""
    if not field_value:
        return ''
    try:
        url = field_value.url
        if request:
            return request.build_absolute_uri(url)
        return url
    except Exception:
        return ''


class ProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = '__all__'

    def get_avatar_url(self, obj):
        return get_file_url(self.context.get('request'), obj.avatar)

    def get_resume_url(self, obj):
        return get_file_url(self.context.get('request'), obj.resume)


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'


class CertificationSerializer(serializers.ModelSerializer):
    certificate_image_url = serializers.SerializerMethodField()
    certificate_pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = '__all__'

    def get_certificate_image_url(self, obj):
        return get_file_url(self.context.get('request'), obj.certificate_image)

    def get_certificate_pdf_url(self, obj):
        return get_file_url(self.context.get('request'), obj.certificate_pdf)


class ProjectScreenshotSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectScreenshot
        fields = ['id', 'image_url', 'caption', 'order']

    def get_image_url(self, obj):
        return get_file_url(self.context.get('request'), obj.image)


class ProjectSerializer(serializers.ModelSerializer):
    screenshots = ProjectScreenshotSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ['is_read', 'created_at']


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'subject', 'message']


class DashboardStatsSerializer(serializers.Serializer):
    total_projects = serializers.IntegerField()
    total_certifications = serializers.IntegerField()
    total_skills = serializers.IntegerField()
    total_education = serializers.IntegerField()
    total_messages = serializers.IntegerField()
    unread_messages = serializers.IntegerField()
