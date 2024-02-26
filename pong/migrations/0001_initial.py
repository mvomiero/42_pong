# Generated by Django 4.2.7 on 2023-12-15 11:22

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GameData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player1_name', models.CharField(max_length=255)),
                ('player1_points', models.PositiveIntegerField()),
                ('player2_name', models.CharField(max_length=255)),
                ('player2_points', models.PositiveIntegerField()),
                ('game_end_timestamp', models.DateTimeField()),
                ('game_duration_secs', models.PositiveIntegerField()),
                ('is_tournament_game', models.BooleanField()),
                ('blockchain_hash', models.CharField(blank=True, max_length=64, null=True)),
            ],
        ),
    ]