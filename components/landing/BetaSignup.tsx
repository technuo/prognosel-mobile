"use client";

import { useState } from "react";

/**
 * The closed-test signup on the landing page.
 *
 * The Android app is on Google Play but only reachable by testers whose account
 * is on our list, so leaving an address is the one useful thing a visitor can do
 * right now. The copy states the 14-day commitment up front — Play's timer runs
 * on testers being opted in *continuously*, so someone who installs and forgets
 * it is worse than someone who never signed up.
 */
type State = "idle" | "sending" | "done" | "error";

export default function BetaSignup() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [state, setState] = useState<State>("idle");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");

    try {
      // Trailing slash: next.config.js sets trailingSlash, so the slashless form
      // answers 308 and costs a redirect hop on every submission.
      const res = await fetch("/api/beta-signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <section className="landing-beta" aria-labelledby="beta-heading">
      <div className="landing-beta-inner">
        <div className="landing-beta-eyebrow">Android · sluten testning</div>
        <h2 className="landing-beta-title" id="beta-heading">
          Bli en av testarna
        </h2>
        <p className="landing-beta-sub">
          Appen är klar men ligger i sluten testning på Google Play. Google kräver att en
          ny utvecklare testar med minst 12 personer i 14 dagar innan appen får släppas –
          så jag söker ungefär 15 personer.
        </p>
        <p className="landing-beta-sub">
          Lämna din e-postadress så lägger jag till dig och skickar installationslänken.
          Du behöver ha appen installerad i 14 dagar.
        </p>

        {state === "done" ? (
          <p className="landing-beta-done" role="status">
            Tack! Använd den Google-adress som är kopplad till Play Store på din telefon
            – jag lägger till dig och skickar länken inom kort.
          </p>
        ) : (
          <form className="landing-beta-form" onSubmit={submit} noValidate={false}>
            <label className="landing-beta-label" htmlFor="beta-email">
              E-postadress
            </label>
            <div className="landing-beta-row">
              <input
                id="beta-email"
                className="landing-beta-input"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="din@epost.se"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={state === "sending"}
              />
              <button
                className="landing-beta-button"
                type="submit"
                disabled={state === "sending"}
              >
                {state === "sending" ? "Skickar…" : "Anmäl intresset"}
              </button>
            </div>

            {/*
              A field a person never sees and never fills in. Hidden from sighted
              users and from screen readers, so a filled value means a script.
            */}
            <input
              className="landing-beta-honeypot"
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
            />

            {state === "error" ? (
              <p className="landing-beta-error" role="alert">
                Kunde inte spara adressen. Försök igen, eller mejla{" "}
                <a href="mailto:hello@prognosel.se">hello@prognosel.se</a>.
              </p>
            ) : null}

            <p className="landing-beta-note">
              Adressen används bara för testinbjudan.{" "}
              <a href="/integritetspolicy">Läs mer i integritetspolicyn</a>.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
