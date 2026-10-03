/**
 * What a "cheapest window" alert says.
 *
 * Kept apart from the route that sends it so the wording can be tested without
 * a scheduler — and so the two notification switches can share one message.
 * Someone with both "Prislarm" and "Påminnelser" on gets a single alert about
 * the window rather than two that fire at the same minute and say the same
 * thing twice.
 */

export interface WindowAlertInput {
  /** True when the window is the next hour, false for the morning digest. */
  timely: boolean;
  /** "HH:00" */
  start: string;
  /** First hour after the window, not part of it. */
  end: string;
  /** Average retail price in öre/kWh. */
  avg: number;
  /** The user has "Prislarm" on. */
  wantsPrice: boolean;
  /** Titles of this user's unfinished tasks, oldest first. */
  openTasks: string[];
}

export interface PushCopy {
  title: string;
  body: string;
}

/**
 * The copy for one recipient, or null when they should not be woken up: a user
 * who only wants task reminders and has nothing left to do has nothing to be
 * told, and must not be sent the price alert they switched off.
 */
export function windowAlert(input: WindowAlertInput): PushCopy | null {
  const { timely, start, end, avg, wantsPrice, openTasks } = input;
  const parts: string[] = [];

  if (wantsPrice) {
    const price = `${Math.round(avg)} öre/kWh`;
    parts.push(
      timely
        ? `Elen är som billigast ${start}–${end} (snitt ${price}).`
        : `Idag är elen billigast ${start}–${end}, snitt ${price}.`
    );
  }

  if (openTasks.length > 0) {
    // Swedish wants the singular through here: "1 öppen uppgift".
    const count =
      openTasks.length === 1
        ? "1 öppen uppgift"
        : `${openTasks.length} öppna uppgifter`;

    parts.push(
      timely
        ? `Du har ${count} kvar – till exempel "${openTasks[0]}".`
        : `${count} väntar på dig i listan.`
    );
  } else if (wantsPrice && timely) {
    // The nudge this alert has always carried for price-only users. With tasks
    // in hand the example above is more specific, so this would be noise.
    parts.push("Bra läge för diskmaskinen eller laddning.");
  }

  if (parts.length === 0) return null;

  return {
    title: timely
      ? wantsPrice
        ? "Billigaste timmarna börjar snart"
        : "Dags för uppgifterna"
      : wantsPrice
        ? "Dagens billigaste timmar"
        : "Dina uppgifter idag",
    body: parts.join(" "),
  };
}
