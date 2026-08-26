from django.db import migrations


def seed_roles(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")
    ContentType = apps.get_model("contenttypes", "ContentType")

    model_names = [
        "sitesettings", "navigationitem", "pagesection", "galleryitem", "teammember",
        "program", "song", "payment", "salary", "expense", "contactmessage",
        "joinapplication", "staffprofile",
    ]
    content_types = {ct.model: ct for ct in ContentType.objects.filter(app_label="core", model__in=model_names)}

    def perms_for(names, actions):
        result = []
        for name in names:
            ct = content_types.get(name)
            if not ct:
                continue
            result.extend(Permission.objects.filter(content_type=ct, codename__in=[f"{a}_{name}" for a in actions]))
        return result

    role_map = {
        "Owner": (model_names, ["view", "add", "change", "delete"]),
        "Administrator": (model_names, ["view", "add", "change", "delete"]),
        "Content Editor": (["sitesettings", "navigationitem", "pagesection", "galleryitem", "teammember", "program", "song", "contactmessage", "joinapplication"], ["view", "add", "change"]),
        "Finance": (["payment", "salary", "expense"], ["view", "add", "change"]),
        "Viewer": (model_names, ["view"]),
    }
    for group_name, (models, actions) in role_map.items():
        group, _ = Group.objects.get_or_create(name=group_name)
        group.permissions.set(perms_for(models, actions))


def remove_roles(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Group.objects.filter(name__in=["Owner", "Administrator", "Content Editor", "Finance", "Viewer"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0001_initial"),
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [migrations.RunPython(seed_roles, remove_roles)]
