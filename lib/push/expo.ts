/**
 * Sending through Expo's push service.
 *
 * The app registers an Expo push token; this posts to Expo, which delivers via
 * FCM on Android and APNs on iOS. Doing it this way means the FCM service
 * account lives in Expo's project settings rather than in this deployment's
 * environment, and adding iOS later needs no new code here.
 */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const MAX_PER_REQUEST = 100;

export interface PushMessage {
  /** Expo push token, "ExponentPushToken[...]". */
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  /** Must match the channel the app created, or Android shows nothing. */
  channelId?: string;
}

export interface PushOutcome {
  sent: number;
  failed: number;
}

export async function sendPush(
  messages: PushMessage[]
): Promise<PushOutcome> {
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < messages.length; i += MAX_PER_REQUEST) {
    const batch = messages.slice(i, i + MAX_PER_REQUEST);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(batch),
      });

      if (!res.ok) {
        console.error(
          `[push] Expo rejected a batch of ${batch.length}: HTTP ${res.status}`
        );
        failed += batch.length;
        continue;
      }

      const json = (await res.json()) as {
        data?: { status?: string; message?: string }[];
      };
      for (const ticket of json.data ?? []) {
        if (ticket.status === "error") {
          // "DeviceNotRegistered" is the common one: the app was uninstalled.
          // A cleanup job for those tokens is a follow-up, not a blocker.
          console.warn("[push] ticket error:", ticket.message);
          failed += 1;
        } else {
          sent += 1;
        }
      }
    } catch (error) {
      console.error("[push] batch failed:", error);
      failed += batch.length;
    }
  }

  return { sent, failed };
}
