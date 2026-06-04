from django.contrib import admin
from .models import Profile, Skill, Education, Certification, Project, ProjectScreenshot, ContactMessage


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'title', 'email', 'location', 'updated_at']
    fieldsets = (
        ('Basic Info', {'fields': ('name', 'title', 'bio', 'career_objective', 'avatar', 'resume')}),
        ('Contact', {'fields': ('email', 'phone', 'location')}),
        ('Social Links', {'fields': ('github_url', 'linkedin_url', 'leetcode_url', 'twitter_url', 'website_url')}),
        ('Stats', {'fields': ('years_of_experience',)}),
    )


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'percentage', 'order']
    list_filter = ['category']
    list_editable = ['percentage', 'order']
    ordering = ['category', 'order']


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ['degree', 'institution', 'start_year', 'end_year', 'cgpa', 'is_current']
    list_filter = ['is_current']


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'issuer', 'issue_date', 'category', 'credential_id']
    list_filter = ['category', 'issuer']
    search_fields = ['title', 'issuer', 'credential_id']


class ProjectScreenshotInline(admin.TabularInline):
    model = ProjectScreenshot
    extra = 1


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'is_featured', 'order', 'created_at']
    list_filter = ['status', 'is_featured']
    list_editable = ['is_featured', 'order']
    inlines = [ProjectScreenshotInline]


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'is_read', 'created_at']
    list_filter = ['is_read']
    list_editable = ['is_read']
    readonly_fields = ['name', 'email', 'subject', 'message', 'created_at']
