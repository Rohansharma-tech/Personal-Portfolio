from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def health_check(request):
    return JsonResponse({'status': 'ok'})


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


