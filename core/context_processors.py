from .admin_views import role_for


def admin_context(request):
    return {"admin_role": role_for(request.user) if request.user.is_authenticated else "viewer"}
