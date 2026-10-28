/**
 * Rest-timer alerts for a static PWA with no push server.
 *
 * What works where (2026):
 * - Sound (Web Audio): every browser while Stronger is on screen. iOS mutes it
 *   when the ring/silent switch is on and after the screen locks.
 * - Vibration: Android Chrome/Edge/Firefox. Safari on iPhone has no Vibration API.
 * - Notification: Android when Stronger is in the background but still running.
 *   iPhone only allows notifications for a Home Screen app through Web Push,
 *   which needs a server, so a locked iPhone cannot be alerted from here.
 * - Keep screen on (Screen Wake Lock): stops the phone locking mid-rest so the
 *   sound and on-screen banner still reach the user. iOS 18.4+ in Home Screen apps.
 */

export type RestAlertPreferences = {
  sound: boolean;
  vibrate: boolean;
  notify: boolean;
  keepAwake: boolean;
};

export const REST_ALERT_STORAGE_KEY = "stronger-rest-alerts";
export const DEFAULT_REST_ALERTS: RestAlertPreferences = { sound: true, vibrate: true, notify: false, keepAwake: false };

export function parseRestAlertPreferences(raw: string | null): RestAlertPreferences {
  if (!raw) return DEFAULT_REST_ALERTS;
  try {
    const value = JSON.parse(raw) as Partial<Record<keyof RestAlertPreferences, unknown>>;
    return {
      sound: typeof value.sound === "boolean" ? value.sound : DEFAULT_REST_ALERTS.sound,
      vibrate: typeof value.vibrate === "boolean" ? value.vibrate : DEFAULT_REST_ALERTS.vibrate,
      notify: typeof value.notify === "boolean" ? value.notify : DEFAULT_REST_ALERTS.notify,
      keepAwake: typeof value.keepAwake === "boolean" ? value.keepAwake : DEFAULT_REST_ALERTS.keepAwake,
    };
  } catch {
    return DEFAULT_REST_ALERTS;
  }
}

export const restAlertSupport = {
  vibrate: () => typeof navigator !== "undefined" && typeof navigator.vibrate === "function",
  notify: () => typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator,
  keepAwake: () => typeof navigator !== "undefined" && "wakeLock" in navigator,
};

let audioContext: AudioContext | null = null;

/** Browsers only start audio from a tap, so unlock it while the user is logging a set. */
export function primeRestAlertSound(): void {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  try {
    audioContext ??= new AudioContextClass();
    if (audioContext.state === "suspended") void audioContext.resume();
  } catch {
    audioContext = null;
  }
}

function playChime(): void {
  if (!audioContext) return;
  if (audioContext.state !== "running") {
    // A context unlocked by a tap a moment ago may still be resuming.
    void audioContext.resume().then(() => {
      if (audioContext?.state === "running") playChime();
    }).catch(() => undefined);
    return;
  }
  const start = audioContext.currentTime + 0.02;
  // Three short rising beeps, loud enough to hear over gym music.
  [880, 988, 1175].forEach((frequency, index) => {
    const context = audioContext!;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const at = start + index * 0.22;
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.5, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(at);
    oscillator.stop(at + 0.2);
  });
}

export async function requestRestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!restAlertSupport.notify()) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

async function showRestNotification(body: string): Promise<void> {
  if (!restAlertSupport.notify() || Notification.permission !== "granted") return;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const options = { body, tag: "stronger-rest", renotify: true, silent: false } as NotificationOptions;
    if (registration) await registration.showNotification("Rest is over", options);
    else new Notification("Rest is over", options);
  } catch {
    // The in-app banner still shows the finished rest.
  }
}

/** Fire every enabled alert once, when a rest period ends. */
export function fireRestAlert(preferences: RestAlertPreferences, nextLabel: string): void {
  if (preferences.sound) playChime();
  if (preferences.vibrate && restAlertSupport.vibrate()) {
    try {
      navigator.vibrate([250, 120, 250, 120, 400]);
    } catch {
      // Some browsers block vibration without a recent tap.
    }
  }
  if (preferences.notify && document.visibilityState === "hidden") void showRestNotification(nextLabel);
}
