/**
 * Rest-timer alerts for a static PWA with no push server.
 *
 * What works where (2026):
 * - Sound (Web Audio): every browser while Stronger is on screen. iOS mutes it
 *   when the ring/silent switch is on and after the screen locks.
 * - Vibration: Android Chrome/Edge/Firefox. Safari on iPhone has no Vibration API.
 * - Locked iPhone: a web app can only be woken by Web Push, which needs a
 *   server. Instead the rest banner can hand the remaining time to an Apple
 *   Shortcut that starts the built-in Clock timer, which rings when locked and
 *   on silent. One-time setup: a shortcut named REST_TIMER_SHORTCUT_NAME whose only action
 *   is "Start Timer" for "Shortcut Input" seconds.
 * - Keep screen on (Screen Wake Lock): stops the phone locking mid-rest so the
 *   sound and on-screen banner still reach the user. iOS 18.4+ in Home Screen apps.
 */

export type RestAlertPreferences = {
  sound: boolean;
  vibrate: boolean;
  iphoneTimer: boolean;
  keepAwake: boolean;
};

export const REST_TIMER_SHORTCUT_NAME = "Stronger Rest";

export const REST_ALERT_STORAGE_KEY = "stronger-rest-alerts";
export const DEFAULT_REST_ALERTS: RestAlertPreferences = { sound: true, vibrate: true, iphoneTimer: false, keepAwake: false };

export function parseRestAlertPreferences(raw: string | null): RestAlertPreferences {
  if (!raw) return DEFAULT_REST_ALERTS;
  try {
    const value = JSON.parse(raw) as Partial<Record<keyof RestAlertPreferences, unknown>>;
    return {
      sound: typeof value.sound === "boolean" ? value.sound : DEFAULT_REST_ALERTS.sound,
      vibrate: typeof value.vibrate === "boolean" ? value.vibrate : DEFAULT_REST_ALERTS.vibrate,
      iphoneTimer: typeof value.iphoneTimer === "boolean" ? value.iphoneTimer : DEFAULT_REST_ALERTS.iphoneTimer,
      keepAwake: typeof value.keepAwake === "boolean" ? value.keepAwake : DEFAULT_REST_ALERTS.keepAwake,
    };
  } catch {
    return DEFAULT_REST_ALERTS;
  }
}

export const restAlertSupport = {
  vibrate: () => typeof navigator !== "undefined" && typeof navigator.vibrate === "function",
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

/** Fire every enabled alert once, when a rest period ends. */
export function fireRestAlert(preferences: RestAlertPreferences): void {
  if (preferences.sound) playChime();
  if (preferences.vibrate && restAlertSupport.vibrate()) {
    try {
      navigator.vibrate([250, 120, 250, 120, 400]);
    } catch {
      // Some browsers block vibration without a recent tap.
    }
  }
}

/** Opens the user's Apple Shortcut with the seconds left, so the Clock app rings at the end. */
export function restTimerShortcutUrl(seconds: number): string {
  const params = new URLSearchParams({ name: REST_TIMER_SHORTCUT_NAME, input: "text", text: String(Math.max(1, Math.round(seconds))) });
  return `shortcuts://run-shortcut?${params.toString().replace(/\+/g, "%20")}`;
}
