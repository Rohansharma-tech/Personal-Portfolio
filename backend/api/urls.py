from django.urls import path
from .views import (
    ProfileView, ProfileUpdateView,
    SkillListCreateView, SkillDetailView,
    EducationListCreateView, EducationDetailView,
    CertificationListCreateView, CertificationDetailView,
    ProjectListCreateView, ProjectDetailView, ProjectScreenshotCreateView,
    ContactCreateView, ContactMessageListView, ContactMessageDetailView, MarkMessageReadView,
    DashboardStatsView,
)

urlpatterns = [
    # Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),

    # Skills
    path('skills/', SkillListCreateView.as_view(), name='skills'),
    path('skills/<int:pk>/', SkillDetailView.as_view(), name='skill-detail'),

    # Education
    path('education/', EducationListCreateView.as_view(), name='education'),
    path('education/<int:pk>/', EducationDetailView.as_view(), name='education-detail'),

    # Certifications
    path('certifications/', CertificationListCreateView.as_view(), name='certifications'),
    path('certifications/<int:pk>/', CertificationDetailView.as_view(), name='certification-detail'),

    # Projects
    path('projects/', ProjectListCreateView.as_view(), name='projects'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('projects/<int:project_id>/screenshots/', ProjectScreenshotCreateView.as_view(), name='project-screenshots'),

    # Contact
    path('contact/', ContactCreateView.as_view(), name='contact'),
    path('contact/messages/', ContactMessageListView.as_view(), name='contact-messages'),
    path('contact/messages/<int:pk>/', ContactMessageDetailView.as_view(), name='contact-message-detail'),
    path('contact/messages/<int:pk>/read/', MarkMessageReadView.as_view(), name='mark-message-read'),

    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
