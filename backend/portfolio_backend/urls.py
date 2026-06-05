from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


import os
from django.contrib.staticfiles.storage import staticfiles_storage
from django.core.files.storage import default_storage

def health_check(request):
    static_root_exists = os.path.exists(settings.STATIC_ROOT)
    static_files = []
    if static_root_exists:
        for root_dir, dirs, files in os.walk(settings.STATIC_ROOT):
            for f in files:
                full_path = os.path.join(root_dir, f)
                # Get relative path for clean display
                rel_path = os.path.relpath(full_path, settings.STATIC_ROOT)
                static_files.append(rel_path)
                if len(static_files) >= 30:
                    break
            if len(static_files) >= 30:
                break

    return JsonResponse({
        'status': 'ok',
        'static_root': str(settings.STATIC_ROOT),
        'static_root_exists': static_root_exists,
        'static_files_sample': static_files,
        'default_storage': default_storage.__class__.__name__,
        'staticfiles_storage': staticfiles_storage.__class__.__name__,
    })


def root(request):
    return JsonResponse({
        "status": "ok",
        "message": "Portfolio API is running",
        "endpoints": {
            "admin": "/django-admin/",
            "api": "/api/",
            "health": "/health/",
            "login": "/api/auth/login/",
        }
    })


urlpatterns = [
    path('', root, name='root'),
    path('health/', health_check, name='health'),
    path('django-admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


