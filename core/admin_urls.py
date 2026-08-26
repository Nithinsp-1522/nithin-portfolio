from django.urls import path

from . import admin_views

urlpatterns = [
    path("login/", admin_views.AdminLoginView.as_view(), name="admin-login"),
    path("logout/", admin_views.admin_logout, name="admin-logout"),
    path("", admin_views.dashboard, name="admin-dashboard"),
    path("content/", admin_views.model_list, {"section": "content"}, name="admin-content"),
    path("gallery/", admin_views.model_list, {"section": "gallery"}, name="admin-gallery"),
    path("team/", admin_views.model_list, {"section": "team"}, name="admin-team"),
    path("programs/", admin_views.model_list, {"section": "programs"}, name="admin-programs"),
    path("songs/", admin_views.model_list, {"section": "songs"}, name="admin-songs"),
    path("payments/", admin_views.model_list, {"section": "payments"}, name="admin-payments"),
    path("salaries/", admin_views.model_list, {"section": "salaries"}, name="admin-salaries"),
    path("expenses/", admin_views.model_list, {"section": "expenses"}, name="admin-expenses"),
    path("messages/", admin_views.model_list, {"section": "messages"}, name="admin-messages"),
    path("applications/", admin_views.model_list, {"section": "applications"}, name="admin-applications"),
    path("settings/", admin_views.model_list, {"section": "settings"}, name="admin-settings"),
    path("staff/", admin_views.model_list, {"section": "staff"}, name="admin-staff"),
    path("<str:section>/add/", admin_views.model_form, {"action": "add"}, name="admin-add"),
    path("<str:section>/<int:pk>/edit/", admin_views.model_form, {"action": "edit"}, name="admin-edit"),
    path("<str:section>/<int:pk>/delete/", admin_views.model_delete, name="admin-delete"),
]
