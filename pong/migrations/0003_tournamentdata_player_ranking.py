# Generated by Django 4.2.7 on 2024-01-12 17:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0002_tournamentdata'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournamentdata',
            name='player_ranking',
            field=models.JSONField(default=['1', '2', '3', '4']),
            preserve_default=False,
        ),
    ]