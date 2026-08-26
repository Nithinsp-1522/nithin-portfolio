from decimal import Decimal

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView
from django.db.models import Sum
from django.http import Http404, HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views import View
from django import forms

from .models import (
    ContactMessage, Expense, GalleryItem, JoinApplication, NavigationItem,
    PageSection, Payment, Program, Salary, SiteSettings, Song, StaffProfile,
    TeamMember,
)


MODEL_MAP = {
    "content": {"label": "Website Content", "models": [SiteSettings, NavigationItem, PageSection]},
    "gallery": {"label": "Gallery", "models": [GalleryItem]},
    "team": {"label": "Team", "models": [TeamMember]},
    "programs": {"label": "Programs", "models": [Program]},
    "songs": {"label": "Songs", "models": [Song]},
    "payments": {"label": "Payments", "models": [Payment]},
    "salaries": {"label": "Salaries", "models": [Salary]},
    "expenses": {"label": "Expenses", "models": [Expense]},
    "messages": {"label": "Contact Messages", "models": [ContactMessage]},
    "applications": {"label": "Join Us Applications", "models": [JoinApplication]},
    "settings": {"label": "Site Settings", "models": [SiteSettings]},
    "staff": {"label": "Staff & Roles", "models": [StaffProfile]},
}

CONTENT_MODELS = {SiteSettings, NavigationItem, PageSection, GalleryItem, TeamMember, Program, Song}
FINANCE_MODELS = {Payment, Salary, Expense}
INBOX_MODELS = {ContactMessage, JoinApplication}


class AdminLoginView(LoginView):
    template_name = "admin/login.html"
    authentication_form = AuthenticationForm
    redirect_authenticated_user = True

    def get_success_url(self):
        return reverse("admin-dashboard")


def admin_logout(request):
    logout(request)
    return redirect("admin-login")


def role_for(user):
    if user.is_superuser:
        return "owner"
    try:
        profile = user.staff_profile
    except StaffProfile.DoesNotExist:
        return "viewer"
    return profile.role if profile.active else "viewer"


def can_view(user, model):
    if user.is_superuser:
        return True
    role = role_for(user)
    if role in {"owner", "admin"}:
        return True
    if role == "editor":
        return model in CONTENT_MODELS or model in INBOX_MODELS
    if role == "finance":
        return model in FINANCE_MODELS
    return model in CONTENT_MODELS or model in INBOX_MODELS


def can_change(user, model):
    if user.is_superuser or role_for(user) in {"owner", "admin"}:
        return True
    if role_for(user) == "editor":
        return model in CONTENT_MODELS or model in INBOX_MODELS
    if role_for(user) == "finance":
        return model in FINANCE_MODELS
    return False


def model_for_section(section):
    config = MODEL_MAP.get(section)
    if not config:
        raise Http404("Unknown admin section")
    return config


def model_for_section_and_pk(section, pk=None):
    config = model_for_section(section)
    models = config["models"]
    if len(models) == 1:
        model = models[0]
    else:
        model = None
        if pk is not None:
            # The content section is grouped; its URLs include model name via query parameter.
            model_name = None
        else:
            model_name = None
        if not model_name:
            model = SiteSettings
    return model


def dashboard(request):
    if not request.user.is_authenticated:
        return redirect("admin-login")
    context = {
        "role": role_for(request.user),
        "counts": {
            "team": TeamMember.objects.filter(active=True).count(),
            "programs": Program.objects.filter(active=True).count(),
            "gallery": GalleryItem.objects.filter(published=True).count(),
            "messages": ContactMessage.objects.filter(status="new").count(),
            "applications": JoinApplication.objects.filter(status="new").count(),
            "pending_payments": Payment.objects.filter(status="pending").count(),
        },
        "finance": {
            "payments": Payment.objects.filter(status="paid").aggregate(total=Sum("amount"))["total"] or Decimal("0.00"),
            "expenses": Expense.objects.aggregate(total=Sum("amount"))["total"] or Decimal("0.00"),
            "salaries": Salary.objects.filter(paid=True).aggregate(total=Sum("gross_amount"))["total"] or Decimal("0.00"),
        },
        "recent_messages": ContactMessage.objects.all()[:5],
        "recent_applications": JoinApplication.objects.all()[:5],
    }
    return render(request, "admin/dashboard.html", context)


def _get_model(section, request):
    config = model_for_section(section)
    if len(config["models"]) == 1:
        model = config["models"][0]
    else:
        model_name = request.GET.get("model") or request.POST.get("model") or request.GET.get("type")
        if model_name:
            model = next((m for m in config["models"] if m.__name__.lower() == model_name.lower()), None)
        else:
            model = config["models"][0]
    if model is None or not can_view(request.user, model):
        raise Http404("Admin section unavailable")
    return model


def _form_for(model, instance=None):
    Meta = type("Meta", (), {
        "model": model,
        "fields": "__all__",
        "exclude": ["created_at", "updated_at"],
    })
    return type(f"{model.__name__}AdminForm", (forms.ModelForm,), {"Meta": Meta})


def _display_value(obj, field):
    value = getattr(obj, field.name, "")
    if value in (None, ""):
        return "—"
    if field.many_to_one:
        return str(value)
    if isinstance(value, bool):
        return "Yes" if value else "No"
    if field.name in {"image", "photo", "logo", "favicon", "audio_file", "receipt"} and value:
        return "Attached"
    return str(value)


@login_required

def model_list(request, section):
    model = _get_model(section, request)
    config = model_for_section(section)
    qs = model.objects.all()
    q = request.GET.get("q", "").strip()
    if q:
        searchable = [f.name for f in model._meta.fields if getattr(f, "max_length", None) or f.get_internal_type() in {"TextField", "EmailField"}]
        from django.db.models import Q
        query = Q()
        for name in searchable:
            query |= Q(**{f"{name}__icontains": q})
        qs = qs.filter(query)
    fields = [f for f in model._meta.fields if f.name not in {"id", "created_at", "updated_at"}]
    return render(request, "admin/list.html", {
        "section": section,
        "section_label": config["label"],
        "model": model,
        "objects": qs[:100],
        "fields": fields[:5],
        "can_change": can_change(request.user, model),
        "models": config["models"],
        "search": q,
    })


@login_required

def model_form(request, section, action, pk=None):
    model = _get_model(section, request)
    if not can_change(request.user, model):
        return HttpResponseForbidden("You do not have permission to change this section.")
    instance = get_object_or_404(model, pk=pk) if action == "edit" else None
    Form = _form_for(model, instance)
    if request.method == "POST":
        form = Form(request.POST, request.FILES, instance=instance)
        if form.is_valid():
            form.save()
            messages.success(request, f"{model._meta.verbose_name.title()} saved successfully.")
            return redirect(reverse("admin-" + section) + (f"?model={model.__name__}" if len(model_for_section(section)["models"]) > 1 else ""))
    else:
        form = Form(instance=instance)
    return render(request, "admin/form.html", {
        "section": section,
        "section_label": model_for_section(section)["label"],
        "model": model,
        "form": form,
        "action": action,
    })


@login_required

def model_delete(request, section, pk):
    model = _get_model(section, request)
    if not can_change(request.user, model):
        return HttpResponseForbidden("You do not have permission to delete this item.")
    obj = get_object_or_404(model, pk=pk)
    if request.method == "POST":
        obj.delete()
        messages.success(request, "Item deleted successfully.")
        return redirect(reverse("admin-" + section) + (f"?model={model.__name__}" if len(model_for_section(section)["models"]) > 1 else ""))
    return render(request, "admin/confirm_delete.html", {"object": obj, "model": model, "section": section})
