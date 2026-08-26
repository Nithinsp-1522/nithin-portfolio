from decimal import Decimal

from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SiteSettings(TimeStampedModel):
    site_name = models.CharField(max_length=120, default="Kurinji")
    tagline = models.CharField(max_length=255, blank=True)
    logo = models.ImageField(upload_to="site/", blank=True, null=True)
    favicon = models.ImageField(upload_to="site/", blank=True, null=True)
    phone = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    whatsapp_number = models.CharField(max_length=40, blank=True)
    primary_color = models.CharField(max_length=20, default="#7c3aed")
    secondary_color = models.CharField(max_length=20, default="#111827")
    seo_title = models.CharField(max_length=180, blank=True)
    seo_description = models.TextField(blank=True)
    seo_keywords = models.TextField(blank=True)
    footer_text = models.TextField(blank=True)

    class Meta:
        verbose_name = "Site settings"
        verbose_name_plural = "Site settings"

    def __str__(self):
        return self.site_name


class NavigationItem(TimeStampedModel):
    STYLE_CHOICES = [("link", "Link"), ("accent", "Accent"), ("success", "Success")]
    label = models.CharField(max_length=80)
    href = models.CharField(max_length=255)
    sort_order = models.PositiveIntegerField(default=0)
    style = models.CharField(max_length=20, choices=STYLE_CHOICES, default="link")
    external = models.BooleanField(default=False)
    visible = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.label


class PageSection(TimeStampedModel):
    page = models.CharField(max_length=80, default="home")
    key = models.SlugField(max_length=80)
    title = models.CharField(max_length=180, blank=True)
    eyebrow = models.CharField(max_length=120, blank=True)
    body = models.TextField(blank=True)
    image = models.ImageField(upload_to="sections/", blank=True, null=True)
    sort_order = models.PositiveIntegerField(default=0)
    visible = models.BooleanField(default=True)
    extra = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["page", "sort_order", "id"]
        constraints = [models.UniqueConstraint(fields=["page", "key"], name="unique_page_section_key")]

    def __str__(self):
        return f"{self.page}: {self.key}"


class GalleryItem(TimeStampedModel):
    title = models.CharField(max_length=160)
    image = models.ImageField(upload_to="gallery/")
    caption = models.TextField(blank=True)
    category = models.CharField(max_length=80, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    published = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.title


class TeamMember(TimeStampedModel):
    ROLE_CHOICES = [("director", "Director"), ("choreographer", "Choreographer"), ("performer", "Performer"), ("staff", "Staff")]
    name = models.CharField(max_length=160)
    role = models.CharField(max_length=40, choices=ROLE_CHOICES, default="performer")
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to="team/", blank=True, null=True)
    phone = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    joined_on = models.DateField(blank=True, null=True)
    active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.name


class Program(TimeStampedModel):
    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"), validators=[MinValueValidator(0)])
    duration_weeks = models.PositiveIntegerField(default=0)
    schedule = models.CharField(max_length=160, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Song(TimeStampedModel):
    title = models.CharField(max_length=180)
    artist = models.CharField(max_length=180, blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    audio_url = models.URLField(blank=True)
    audio_file = models.FileField(upload_to="songs/", blank=True, null=True)
    notes = models.TextField(blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class Payment(TimeStampedModel):
    STATUS_CHOICES = [("pending", "Pending"), ("paid", "Paid"), ("failed", "Failed"), ("refunded", "Refunded")]
    payer_name = models.CharField(max_length=160)
    payer_email = models.EmailField(blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    purpose = models.CharField(max_length=180, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    transaction_id = models.CharField(max_length=160, blank=True, db_index=True)
    paid_on = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.payer_name} - {self.amount}"


class Salary(TimeStampedModel):
    member = models.ForeignKey(TeamMember, on_delete=models.PROTECT, related_name="salaries")
    month = models.DateField(help_text="Use the first day of the salary month.")
    gross_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    deductions = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), validators=[MinValueValidator(0)])
    paid = models.BooleanField(default=False)
    paid_on = models.DateField(blank=True, null=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-month", "member__name"]
        constraints = [models.UniqueConstraint(fields=["member", "month"], name="unique_member_salary_month")]

    @property
    def net_amount(self):
        return self.gross_amount - self.deductions

    def __str__(self):
        return f"{self.member.name} - {self.month:%Y-%m}"


class Expense(TimeStampedModel):
    CATEGORY_CHOICES = [("venue", "Venue"), ("travel", "Travel"), ("costume", "Costume"), ("equipment", "Equipment"), ("marketing", "Marketing"), ("other", "Other")]
    title = models.CharField(max_length=180)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default="other")
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    spent_on = models.DateField()
    vendor = models.CharField(max_length=160, blank=True)
    receipt = models.FileField(upload_to="expenses/", blank=True, null=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-spent_on", "-id"]

    def __str__(self):
        return self.title


class ContactMessage(TimeStampedModel):
    STATUS_CHOICES = [("new", "New"), ("read", "Read"), ("replied", "Replied"), ("archived", "Archived")]
    name = models.CharField(max_length=160)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    subject = models.CharField(max_length=180, blank=True)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")
    admin_notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.subject or 'Contact'}"


class JoinApplication(TimeStampedModel):
    STATUS_CHOICES = [("new", "New"), ("reviewing", "Reviewing"), ("accepted", "Accepted"), ("rejected", "Rejected")]
    name = models.CharField(max_length=160)
    email = models.EmailField()
    phone = models.CharField(max_length=40)
    age = models.PositiveIntegerField(blank=True, null=True)
    experience = models.TextField(blank=True)
    preferred_program = models.ForeignKey(Program, on_delete=models.SET_NULL, null=True, blank=True, related_name="applications")
    availability = models.CharField(max_length=180, blank=True)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")
    admin_notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class StaffProfile(TimeStampedModel):
    ROLE_CHOICES = [("owner", "Owner"), ("admin", "Administrator"), ("editor", "Content Editor"), ("finance", "Finance"), ("viewer", "Viewer")]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="staff_profile")
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default="viewer")
    phone = models.CharField(max_length=40, blank=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.get_username()} ({self.role})"
