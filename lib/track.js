// Client-side analytics helper. Sends anonymous events to /api/analytics-store.
// The session id is random and lives only for the browser tab session.
const KEY = 'skyline_sid';

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

export function getSessionId() {
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = randomId();
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    if (!window.__skylineSid) window.__skylineSid = randomId();
    return window.__skylineSid;
  }
}

export function track(event, data = {}) {
  try {
    fetch('/api/analytics-store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, sessionId: getSessionId(), data }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics must never break the page.
  }
}

// Counts a visit once per browser tab session, whichever page the student lands on.
export function trackSessionStart() {
  try {
    if (sessionStorage.getItem('skyline_session_counted')) return;
    sessionStorage.setItem('skyline_session_counted', '1');
  } catch {
    if (window.__skylineSessionCounted) return;
    window.__skylineSessionCounted = true;
  }
  track('session_start');
}
