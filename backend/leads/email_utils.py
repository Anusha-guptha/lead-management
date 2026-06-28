import requests
from django.conf import settings

BREVO_URL = "https://api.brevo.com/v3/smtp/email"


def send_notification_email(subject, content):
    if not settings.BREVO_API_KEY or not settings.NOTIFICATION_EMAIL_TO:
        print("Brevo not configured — skipping email.")
        return False

    payload = {
        "sender": {"email": settings.NOTIFICATION_EMAIL_FROM},
        "to": [{"email": settings.NOTIFICATION_EMAIL_TO}],
        "subject": subject,
        "textContent": content,
    }
    headers = {
        "api-key": settings.BREVO_API_KEY,
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(BREVO_URL, json=payload, headers=headers, timeout=5)
        print("Brevo response:", response.status_code, response.text)
        return response.status_code in (200, 201)
    except requests.RequestException as e:
        print("Brevo error:", e)
        return False


def notify_new_lead(lead):
    subject = f"New Lead: {lead.name}"
    content = (
        f"A new lead was added.\n\n"
        f"Name: {lead.name}\n"
        f"Email: {lead.email}\n"
        f"Phone: {lead.phone or '-'}\n"
        f"Company: {lead.company or '-'}\n"
        f"Status: {lead.status}\n"
        f"Added by: {lead.owner.username}\n"
    )
    send_notification_email(subject, content)
