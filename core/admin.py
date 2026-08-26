from django.contrib import admin

from .models import (
    ContactMessage,
    Expense,
    GalleryItem,
    JoinApplication,
    NavigationItem,
    PageSection,
    Payment,
    Program,
    Salary,
    SiteSettings,
    Song,
    StaffProfile,
    TeamMember,
)


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ("Brand", {"fields": ("site_name", "tagline", "logo", "favicon")} ),
        ("Contact", {"fields": ("phone", "email", "address", "instagram_url", "facebook_url", "youtube_url", "whatsapp_number")} ),
        ("Design", {"fields": ("primary_color", "secondary_color")} ),
        ("SEO", {"fields": ("seo_title", "seo_description", "seo_keywords")} ),
        ("Footer", {"fields": ("footer_text",)}),
    )


@admin.register(NavigationItem)
class NavigationItemAdmin(admin.ModelAdmin):
    list_display = ("label", "href", "style", "visible", "sort_order")
    list_editable = ("visible", "sort_order")
    list_filter = ("visible", "style", "external")
    search_fields = ("label", "href")


@admin.register(PageSection)
class PageSectionAdmin(admin.ModelAdmin):
    list_display = ("page", "key", "title", "visible", "sort_order")
    list_filter = ("page", "visible")
    search_fields = ("key", "title", "body")


@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "published", "sort_order", "created_at")
    list_filter = ("published", "category")
    search_fields = ("title", "caption", "category")


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "active", "joined_on", "sort_order")
    list_filter = ("role", "active")
    search_fields = ("name", "email", "phone")


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ("name", "fee", "duration_weeks", "schedule", "active")
    list_filter = ("active",)
    search_fields = ("name", "description")


@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ("title", "artist", "duration_seconds", "active")
    list_filter = ("active",)
    search_fields = ("title", "artist")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("payer_name", "amount", "purpose", "status", "paid_on", "created_at")
    list_filter = ("status", "purpose")
    search_fields = ("payer_name", "payer_email", "transaction_id")
    date_hierarchy = "created_at"


@admin.register(Salary)
class SalaryAdmin(admin.ModelAdmin):
    list_display = ("member", "month", "gross_amount", "deductions", "net_amount", "paid")
    list_filter = ("paid", "month")
    search_fields = ("member__name",)


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "amount", "spent_on", "vendor")
    list_filter = ("category", "spent_on")
    search_fields = ("title", "vendor", "notes")
    date_hierarchy = "spent_on"


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("created_at", "updated_at")


@admin.register(JoinApplication)
class JoinApplicationAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "preferred_program", "status", "created_at")
    list_filter = ("status", "preferred_program")
    search_fields = ("name", "email", "phone", "experience", "message")
    readonly_fields = ("created_at", "updated_at")


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "active", "created_at")
    list_filter = ("role", "active")
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name")
