import type { Handler } from '@netlify/functions';

interface BookingPayload {
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  condition_title: string;
  date: string;
  start_time: string;
  end_time: string;
  booking_reference: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';
const CLINIC_EMAIL = 'elitephysioclinics@gmail.com';
const FROM_EMAIL = 'Elite Physio Clinics <onboarding@resend.dev>';

const CLINIC_INFO = {
  name: 'Elite Physio Clinics',
  phone: '+44 333 577 9553',
  whatsapp: '+44 7405 825954',
  email: 'elitephysioclinics@gmail.com',
  address: 'Mare Fair, Sol Central, Ground Floor, Unit 3, Northampton NN1 1SR',
};

// --- Formatting helpers ---

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

// --- Email templates ---

function clinicEmailHtml(r: BookingPayload): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f4f1ea;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0a1f13;border:1px solid #c9a042;">
        <tr><td style="padding:32px 40px;border-bottom:1px solid rgba(201,160,66,0.2);">
          <div style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#c9a042;font-weight:700;">New Booking Received</div>
          <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:28px;font-weight:300;color:#faf6ef;line-height:1.2;">${r.patient_name}</h1>
        </td></tr>
        <tr><td style="padding:28px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="color:#faf6ef;font-size:14px;line-height:1.8;">
            <tr><td style="padding:8px 0;border-bottom:1px solid rgba(250,246,239,0.08);color:rgba(250,246,239,0.55);text-transform:uppercase;letter-spacing:0.12em;font-size:11px;">Reference</td>
                <td style="padding:8px 0;border-bottom:1px solid rgba(250,246,239,0.08);text-align:right;color:#c9a042;font-weight:600;">${r.booking_reference}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid rgba(250,246,239,0.08);color:rgba(250,246,239,0.55);text-transform:uppercase;letter-spacing:0.12em;font-size:11px;">Condition</td>
                <td style="padding:8px 0;border-bottom:1px solid rgba(250,246,239,0.08);text-align:right;">${r.condition_title}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid rgba(250,246,239,0.08);color:rgba(250,246,239,0.55);text-transform:uppercase;letter-spacing:0.12em;font-size:11px;">Date</td>
                <td style="padding:8px 0;border-bottom:1px solid rgba(250,246,239,0.08);text-align:right;">${formatDate(r.date)}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid rgba(250,246,239,0.08);color:rgba(250,246,239,0.55);text-transform:uppercase;letter-spacing:0.12em;font-size:11px;">Time</td>
                <td style="padding:8px 0;border-bottom:1px solid rgba(250,246,239,0.08);text-align:right;">${formatTime(r.start_time)} &ndash; ${formatTime(r.end_time)}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid rgba(250,246,239,0.08);color:rgba(250,246,239,0.55);text-transform:uppercase;letter-spacing:0.12em;font-size:11px;">Phone</td>
                <td style="padding:8px 0;border-bottom:1px solid rgba(250,246,239,0.08);text-align:right;"><a href="tel:${r.patient_phone}" style="color:#faf6ef;text-decoration:none;">${r.patient_phone}</a></td></tr>
            <tr><td style="padding:8px 0;color:rgba(250,246,239,0.55);text-transform:uppercase;letter-spacing:0.12em;font-size:11px;">Email</td>
                <td style="padding:8px 0;text-align:right;"><a href="mailto:${r.patient_email}" style="color:#faf6ef;text-decoration:none;">${r.patient_email}</a></td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 40px;background:rgba(201,160,66,0.05);border-top:1px solid rgba(201,160,66,0.15);">
          <div style="font-size:11px;color:rgba(250,246,239,0.45);letter-spacing:0.08em;">This booking was submitted via the Elite Physio Clinics website.</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function patientEmailHtml(r: BookingPayload): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f4f1ea;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0a1f13;border:1px solid #c9a042;">
        <tr><td style="padding:40px;border-bottom:1px solid rgba(201,160,66,0.2);text-align:center;">
          <div style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#c9a042;font-weight:700;">Booking Confirmed</div>
          <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:32px;font-weight:300;color:#faf6ef;line-height:1.2;">Thank you, ${r.patient_name.split(' ')[0]}</h1>
          <p style="margin:12px 0 0;color:rgba(250,246,239,0.65);font-size:14px;line-height:1.6;">Your appointment at Elite Physio Clinics has been confirmed.</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="color:#faf6ef;font-size:14px;line-height:1.8;">
            <tr><td style="padding:10px 0;border-bottom:1px solid rgba(250,246,239,0.08);color:rgba(250,246,239,0.55);text-transform:uppercase;letter-spacing:0.12em;font-size:11px;">Reference</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(250,246,239,0.08);text-align:right;color:#c9a042;font-weight:600;">${r.booking_reference}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid rgba(250,246,239,0.08);color:rgba(250,246,239,0.55);text-transform:uppercase;letter-spacing:0.12em;font-size:11px;">Treatment</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(250,246,239,0.08);text-align:right;">${r.condition_title}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid rgba(250,246,239,0.08);color:rgba(250,246,239,0.55);text-transform:uppercase;letter-spacing:0.12em;font-size:11px;">Date</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(250,246,239,0.08);text-align:right;">${formatDate(r.date)}</td></tr>
            <tr><td style="padding:10px 0;color:rgba(250,246,239,0.55);text-transform:uppercase;letter-spacing:0.12em;font-size:11px;">Time</td>
                <td style="padding:10px 0;text-align:right;">${formatTime(r.start_time)} &ndash; ${formatTime(r.end_time)}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 40px;background:rgba(201,160,66,0.05);border-top:1px solid rgba(201,160,66,0.15);">
          <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#c9a042;font-weight:700;margin-bottom:12px;">Clinic Location</div>
          <div style="color:#faf6ef;font-size:14px;line-height:1.7;">${CLINIC_INFO.address}</div>
          <div style="margin-top:12px;font-size:13px;color:rgba(250,246,239,0.7);">
            <a href="tel:${CLINIC_INFO.phone}" style="color:#c9a042;text-decoration:none;">${CLINIC_INFO.phone}</a>
            &nbsp;&middot;&nbsp;
            <a href="mailto:${CLINIC_INFO.email}" style="color:#c9a042;text-decoration:none;">${CLINIC_INFO.email}</a>
          </div>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(201,160,66,0.15);">
          <div style="font-size:12px;color:rgba(250,246,239,0.55);line-height:1.7;">
            <strong style="color:#faf6ef;font-weight:600;">Need to reschedule or cancel?</strong><br>
            Please call us on <a href="tel:${CLINIC_INFO.phone}" style="color:#c9a042;text-decoration:none;">${CLINIC_INFO.phone}</a> or WhatsApp us on <a href="https://wa.me/447405825954" style="color:#c9a042;text-decoration:none;">${CLINIC_INFO.whatsapp}</a> at least 24 hours in advance.
          </div>
        </td></tr>
        <tr><td style="padding:20px 40px;background:#060f08;text-align:center;">
          <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(250,246,239,0.4);">Elite Physio Clinics &middot; Northampton</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// --- Resend sender ---

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}

// --- Handler ---

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  if (!RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY environment variable');
    return { statusCode: 500, body: JSON.stringify({ error: 'Email not configured' }) };
  }

  let booking: BookingPayload;
  try {
    booking = JSON.parse(event.body ?? '');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const results = await Promise.allSettled([
    sendEmail(
      CLINIC_EMAIL,
      `New booking: ${booking.patient_name} — ${formatDate(booking.date)} ${formatTime(booking.start_time)}`,
      clinicEmailHtml(booking),
    ),
    sendEmail(
      booking.patient_email,
      `Your appointment at Elite Physio Clinics — ${formatDate(booking.date)}`,
      patientEmailHtml(booking),
    ),
  ]);

  const failures = results.filter((r) => r.status === 'rejected');
  const errorMessages = failures.map((r) => r.status === 'rejected' ? String(r.reason) : '');

  if (failures.length > 0) {
    console.error('Email failures:', errorMessages);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: failures.length === 0,
      sent: results.length - failures.length,
      failed: failures.length,
      errors: errorMessages,
    }),
  };
};

export { handler };
