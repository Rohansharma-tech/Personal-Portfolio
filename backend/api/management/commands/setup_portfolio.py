import os
import django
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create superuser and seed initial portfolio data'

    def handle(self, *args, **kwargs):
        # Create superuser
        email = os.environ.get('ADMIN_EMAIL', 'admin@portfolio.com')
        password = os.environ.get('ADMIN_PASSWORD', 'admin123')
        username = 'admin'

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'[OK] Superuser created: {username} / {password}'))
        else:
            self.stdout.write(self.style.WARNING('[SKIP] Superuser already exists'))

        # Seed Profile
        from api.models import Profile, Skill, Education
        if not Profile.objects.exists():
            Profile.objects.create(
                name='Your Name',
                title='Full Stack Developer',
                bio='Passionate developer with expertise in building modern web applications.',
                career_objective='Seeking challenging opportunities to leverage my technical skills and contribute to innovative projects.',
                email='your@email.com',
                phone='+91 00000 00000',
                location='India',
                github_url='https://github.com/yourusername',
                linkedin_url='https://linkedin.com/in/yourusername',
                leetcode_url='https://leetcode.com/yourusername',
            )
            self.stdout.write(self.style.SUCCESS('[OK] Profile created'))

        # Seed Skills
        if not Skill.objects.exists():
            default_skills = [
                ('Python', 'language', 90),
                ('JavaScript', 'language', 85),
                ('React.js', 'frontend', 85),
                ('Django', 'backend', 88),
                ('PostgreSQL', 'database', 80),
                ('Git', 'tools', 90),
                ('Docker', 'devops', 70),
                ('Tailwind CSS', 'frontend', 85),
            ]
            for name, category, pct in default_skills:
                Skill.objects.create(name=name, category=category, percentage=pct)
            self.stdout.write(self.style.SUCCESS('[OK] Default skills seeded'))

        # Seed Education
        if not Education.objects.exists():
            Education.objects.create(
                degree='Bachelor of Technology (B.Tech)',
                institution='Your College Name',
                location='City, State',
                cgpa=8.5,
                start_year=2021,
                end_year=2025,
                is_current=True,
                description='Computer Science & Engineering'
            )
            self.stdout.write(self.style.SUCCESS('[OK] Education seeded'))

        self.stdout.write(self.style.SUCCESS('\nSetup complete! Login at /django-admin/ or via API /api/auth/login/'))
        self.stdout.write(self.style.SUCCESS(f'   Username: {username}'))
        self.stdout.write(self.style.SUCCESS(f'   Password: {password}'))
