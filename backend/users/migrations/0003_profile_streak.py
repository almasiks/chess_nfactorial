from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_subscription_friendship"),
    ]

    operations = [
        migrations.AddField(
            model_name="profile",
            name="current_streak",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="profile",
            name="last_login_date",
            field=models.DateField(blank=True, null=True),
        ),
    ]
