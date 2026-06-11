"""
Contact form rate throttles — two layers of protection:

  1. ContactBurstThrottle   — max 2 requests per minute  (anti-double-click / flood)
  2. ContactSustainThrottle — max 5 requests per hour    (anti-spam / abuse)

Both are keyed by client IP address (falls back to user PK for authenticated users).
Throttle state is stored in Django's cache (LocMemCache in dev, Redis in prod).

If either limit is hit, DRF automatically returns HTTP 429 Too Many Requests
with a Retry-After header telling the client exactly how many seconds to wait.
"""
from rest_framework.throttling import AnonRateThrottle


class ContactBurstThrottle(AnonRateThrottle):
    """Short-window protection: prevents double-submits and rapid flooding."""
    scope = 'contact_burst'


class ContactSustainThrottle(AnonRateThrottle):
    """Long-window protection: caps sustained abuse to 5 messages per hour."""
    scope = 'contact_sustain'
