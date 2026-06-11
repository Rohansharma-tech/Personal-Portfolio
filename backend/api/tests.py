import uuid
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.cache import cache as django_cache
from rest_framework.throttling import SimpleRateThrottle
from api.models import Profile, Skill, Education, Certification, Project, ContactMessage

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
# Health & Root
# ─────────────────────────────────────────────────────────────────────────────

class HealthCheckTest(TestCase):
    def test_health_endpoint_returns_200(self):
        res = self.client.get('/health/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'ok')

    def test_root_endpoint_returns_api_info(self):
        res = self.client.get('/')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn('endpoints', data)
        self.assertEqual(data['status'], 'ok')


# ─────────────────────────────────────────────────────────────────────────────
# Profile
# ─────────────────────────────────────────────────────────────────────────────

class ProfileAPITest(TestCase):
    def test_profile_returns_empty_dict_when_none_exists(self):
        res = self.client.get('/api/profile/')
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.json(), dict)

    def test_profile_returns_data_when_exists(self):
        Profile.objects.create(
            name='Rohan Sharma',
            title='Full Stack Developer',
            email='rohan@test.com',
        )
        res = self.client.get('/api/profile/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['name'], 'Rohan Sharma')

    def test_profile_update_requires_authentication(self):
        res = self.client.put(
            '/api/profile/update/',
            data='{"name": "Hacker"}',
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 401)

    def test_profile_update_succeeds_with_auth(self):
        user = User.objects.create_superuser('adminp', 'adminp@test.com', 'StrongPass123!')
        login_res = self.client.post(
            '/api/auth/login/',
            data='{"username": "adminp", "password": "StrongPass123!"}',
            content_type='application/json'
        )
        token = login_res.json()['access']
        Profile.objects.create(name='Old Name', title='Dev')
        res = self.client.put(
            '/api/profile/update/',
            data='{"name": "New Name"}',
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {token}'
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['name'], 'New Name')


# ─────────────────────────────────────────────────────────────────────────────
# Skills
# ─────────────────────────────────────────────────────────────────────────────

class SkillsAPITest(TestCase):
    def setUp(self):
        Skill.objects.create(name='Python', category='language', percentage=90)
        Skill.objects.create(name='React',  category='frontend',  percentage=85)

    def test_skills_list_is_public(self):
        res = self.client.get('/api/skills/')
        self.assertEqual(res.status_code, 200)

    def test_skills_list_returns_all_skills(self):
        res = self.client.get('/api/skills/')
        data = res.json()
        results = data.get('results', data)
        self.assertEqual(len(results), 2)

    def test_skill_create_requires_auth(self):
        res = self.client.post(
            '/api/skills/',
            data='{"name": "Go", "category": "language", "percentage": 70}',
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 401)

    def test_skill_create_with_auth(self):
        User.objects.create_superuser('admin3', 'a3@b.com', 'StrongPass123!')
        login_res = self.client.post(
            '/api/auth/login/',
            data='{"username": "admin3", "password": "StrongPass123!"}',
            content_type='application/json'
        )
        token = login_res.json()['access']
        res = self.client.post(
            '/api/skills/',
            data='{"name": "Go", "category": "language", "percentage": 70}',
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {token}'
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['name'], 'Go')


# ─────────────────────────────────────────────────────────────────────────────
# Projects
# ─────────────────────────────────────────────────────────────────────────────

class ProjectsAPITest(TestCase):
    def setUp(self):
        self.project = Project.objects.create(
            title='Test Project',
            description='A test project description.',
            short_description='Short desc',
            status='completed',
            is_featured=True,
        )

    def test_projects_list_is_public(self):
        res = self.client.get('/api/projects/')
        self.assertEqual(res.status_code, 200)

    def test_projects_featured_filter(self):
        Project.objects.create(title='Non-featured', description='desc', is_featured=False)
        res = self.client.get('/api/projects/?featured=true')
        data = res.json()
        results = data.get('results', data)
        self.assertTrue(all(p['is_featured'] for p in results))

    def test_projects_status_filter(self):
        Project.objects.create(title='WIP', description='desc', status='in_progress')
        res = self.client.get('/api/projects/?status=in_progress')
        data = res.json()
        results = data.get('results', data)
        self.assertTrue(all(p['status'] == 'in_progress' for p in results))

    def test_project_create_requires_auth(self):
        res = self.client.post(
            '/api/projects/',
            data='{"title": "Evil", "description": "bad"}',
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 401)

    def test_project_detail_is_not_public(self):
        res = self.client.get(f'/api/projects/{self.project.id}/')
        self.assertEqual(res.status_code, 401)


# ─────────────────────────────────────────────────────────────────────────────
# Education
# ─────────────────────────────────────────────────────────────────────────────

class EducationAPITest(TestCase):
    def test_education_list_is_public(self):
        res = self.client.get('/api/education/')
        self.assertEqual(res.status_code, 200)

    def test_education_create_requires_auth(self):
        res = self.client.post(
            '/api/education/',
            data='{"degree": "B.Tech", "institution": "Test College", "start_year": 2020}',
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 401)


# ─────────────────────────────────────────────────────────────────────────────
# Certifications
# ─────────────────────────────────────────────────────────────────────────────

class CertificationsAPITest(TestCase):
    def test_certifications_list_is_public(self):
        res = self.client.get('/api/certifications/')
        self.assertEqual(res.status_code, 200)

    def test_certification_create_requires_auth(self):
        res = self.client.post(
            '/api/certifications/',
            data='{"title": "AWS", "issuer": "Amazon", "issue_date": "2024-01-01"}',
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 401)


# ─────────────────────────────────────────────────────────────────────────────
# Contact (throttling bypassed for basic submission tests)
# ─────────────────────────────────────────────────────────────────────────────

class ContactAPITest(TestCase):
    """Basic contact form tests. Throttling bypassed via setUp/tearDown."""

    def setUp(self):
        from api.views import ContactCreateView
        self._orig = ContactCreateView.throttle_classes
        ContactCreateView.throttle_classes = []

    def tearDown(self):
        from api.views import ContactCreateView
        ContactCreateView.throttle_classes = self._orig

    def test_submit_valid_contact_message(self):
        res = self.client.post(
            '/api/contact/',
            data='{"name": "Alice", "email": "alice@example.com", "message": "Hello Rohan!"}',
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 201)
        self.assertTrue(res.json().get('success'))
        self.assertEqual(ContactMessage.objects.count(), 1)

    def test_submit_contact_with_subject(self):
        res = self.client.post(
            '/api/contact/',
            data='{"name": "Bob", "email": "bob@example.com", "subject": "Job offer", "message": "Are you open to work?"}',
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 201)

    def test_submit_contact_missing_required_fields(self):
        res = self.client.post(
            '/api/contact/',
            data='{"name": "No Email"}',
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 400)

    def test_submit_contact_invalid_email(self):
        res = self.client.post(
            '/api/contact/',
            data='{"name": "Bad", "email": "not-an-email", "message": "hello"}',
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 400)

    def test_messages_list_requires_auth(self):
        res = self.client.get('/api/contact/messages/')
        self.assertEqual(res.status_code, 401)


# ─────────────────────────────────────────────────────────────────────────────
# Authentication (JWT)
# ─────────────────────────────────────────────────────────────────────────────

class AuthAPITest(TestCase):
    def setUp(self):
        User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='StrongPass123!'
        )

    def test_login_with_valid_credentials_returns_tokens(self):
        res = self.client.post(
            '/api/auth/login/',
            data='{"username": "admin", "password": "StrongPass123!"}',
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn('access', data)
        self.assertIn('refresh', data)

    def test_login_with_wrong_password_returns_401(self):
        res = self.client.post(
            '/api/auth/login/',
            data='{"username": "admin", "password": "wrongpassword"}',
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 401)

    def test_dashboard_stats_requires_auth(self):
        res = self.client.get('/api/dashboard/stats/')
        self.assertEqual(res.status_code, 401)

    def test_dashboard_stats_with_valid_token(self):
        login_res = self.client.post(
            '/api/auth/login/',
            data='{"username": "admin", "password": "StrongPass123!"}',
            content_type='application/json'
        )
        token = login_res.json()['access']
        res = self.client.get(
            '/api/dashboard/stats/',
            HTTP_AUTHORIZATION=f'Bearer {token}'
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn('total_projects', data)
        self.assertIn('unread_messages', data)


# ─────────────────────────────────────────────────────────────────────────────
# Rate Limiting (Contact Form Throttling)
# ─────────────────────────────────────────────────────────────────────────────

class _TightBurstThrottle(SimpleRateThrottle):
    """1 req/min throttle injected directly into the view for precise test control."""
    scope = 'test_tight_burst'
    rate = '1/min'

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return f'throttle_test_tight_{ident}'


class RateLimitTest(TestCase):
    """
    Tests for two-layer rate limiting on POST /api/contact/.

    Strategy:
    - Inject _TightBurstThrottle (1/min) directly on ContactCreateView.throttle_classes
      for tests that need to trigger 429. This bypasses DRF's settings-cache issue.
    - Each test gets a unique IP + fresh cache (setUp) to prevent inter-test bleed.
    - Restore original throttle_classes in finally blocks.
    """

    VALID = '{"name": "Tester", "email": "t@test.com", "message": "Hi!"}'

    def setUp(self):
        django_cache.clear()
        n = uuid.uuid4().int
        self.ip = f'{10 + n % 100}.{n % 256}.{(n >> 8) % 256}.{(n >> 16) % 254 + 1}'

    def _post(self, ip=None):
        return self.client.post(
            '/api/contact/', data=self.VALID,
            content_type='application/json',
            REMOTE_ADDR=ip or self.ip,
        )

    def _inject(self):
        from api.views import ContactCreateView
        orig = ContactCreateView.throttle_classes
        ContactCreateView.throttle_classes = [_TightBurstThrottle]
        return orig

    def _restore(self, orig):
        from api.views import ContactCreateView
        ContactCreateView.throttle_classes = orig

    # ── Basic throttle off ──────────────────────────────────────────────────

    def test_first_request_succeeds(self):
        """A single request with no throttle returns 201."""
        from api.views import ContactCreateView
        orig = ContactCreateView.throttle_classes
        ContactCreateView.throttle_classes = []
        try:
            res = self._post()
            self.assertEqual(res.status_code, 201)
            self.assertTrue(res.json().get('success'))
        finally:
            self._restore(orig)

    # ── Throttle triggers 429 ───────────────────────────────────────────────

    def test_burst_throttle_triggers_429(self):
        """Request 1 succeeds; request 2 from same IP gets 429."""
        orig = self._inject()
        try:
            r1 = self._post()
            r2 = self._post()
            self.assertEqual(r1.status_code, 201, 'Request 1 must succeed')
            self.assertEqual(r2.status_code, 429, 'Request 2 must be throttled')
        finally:
            self._restore(orig)

    # ── 429 response body ───────────────────────────────────────────────────

    def test_429_body_has_error_field(self):
        """429 body must contain error='rate_limited'."""
        orig = self._inject()
        try:
            self._post()
            res = self._post()
            self.assertEqual(res.status_code, 429)
            body = res.json()
            self.assertEqual(body.get('error'), 'rate_limited', f'Unexpected body: {body}')
        finally:
            self._restore(orig)

    def test_429_body_has_message_field(self):
        """429 body must contain a human-readable message string."""
        orig = self._inject()
        try:
            self._post()
            res = self._post()
            self.assertEqual(res.status_code, 429)
            self.assertIn('message', res.json())
        finally:
            self._restore(orig)

    def test_429_body_has_positive_retry_after(self):
        """429 body must contain retry_after as a positive integer."""
        orig = self._inject()
        try:
            self._post()
            res = self._post()
            self.assertEqual(res.status_code, 429)
            retry = res.json().get('retry_after')
            self.assertIsNotNone(retry)
            self.assertGreater(int(retry), 0)
        finally:
            self._restore(orig)

    # ── HTTP header ─────────────────────────────────────────────────────────

    def test_429_has_retry_after_header(self):
        """HTTP response must include Retry-After header on 429."""
        orig = self._inject()
        try:
            self._post()
            res = self._post()
            self.assertEqual(res.status_code, 429)
            self.assertIn('Retry-After', res)
        finally:
            self._restore(orig)

    # ── Per-IP isolation ────────────────────────────────────────────────────

    def test_throttle_is_per_ip_not_global(self):
        """Different IPs must have independent throttle buckets."""
        orig = self._inject()
        try:
            self._post(ip='172.16.0.1')   # IP A hits limit
            res = self._post(ip='172.16.0.2')  # IP B unaffected
            self.assertEqual(res.status_code, 201, 'Different IP must not be throttled')
        finally:
            self._restore(orig)

    # ── Scope isolation ─────────────────────────────────────────────────────

    def test_contact_throttle_doesnt_affect_profile_endpoint(self):
        """GET /api/profile/ must return 200 even after contact throttle fires."""
        orig = self._inject()
        try:
            self._post()   # consume limit
            self._post()   # 429
            r = self.client.get('/api/profile/', REMOTE_ADDR=self.ip)
            self.assertEqual(r.status_code, 200)
        finally:
            self._restore(orig)
