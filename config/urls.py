from django.contrib import admin
from django.urls import include, path

from core.public_views import public_file

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("admin-panel/", include("core.admin_urls")),
    path("", public_file, {"filename": "index.html"}, name="public-home"),
    path("<path:filename>", public_file, name="public-file"),
]
