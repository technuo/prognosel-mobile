"use client";

import MobileWrapper from "@/components/layout/mobile-wrapper";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

function PrognosLogo({ size = 64 }: { size?: number }) {
  return (
    <div
      className="rounded-[18%] overflow-hidden shadow-[inset_0_-4px_6px_rgba(0,0,0,0.08)]"
      style={{ width: size, height: size }}
    >
      <img
        src="/logo.png"
        alt="PrognosEL"
        width={size}
        height={size}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default function LoginPage() {
  const { signInWithGoogle, signInWithGitHub } = useAuth();
  const { lang, t, setLang } = useLanguage();

  return (
    <MobileWrapper>
      <div className="h-screen flex flex-col bg-paper relative">
        {/* Decorative top arc */}
        <div
          className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full pointer-events-none opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--accent-soft) 0%, transparent 70%)",
          }}
        />

        <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
          <div className="mb-7">
            <PrognosLogo size={64} />
          </div>
          <h1 className="font-serif text-[32px] font-bold text-ink mb-1.5 tracking-tight">
            {t.appName}
          </h1>
          <p className="text-[15px] text-muted mb-12 text-center leading-relaxed">
            {t.tagline}
          </p>

          <div className="w-full max-w-[320px]">
            <p className="text-[13px] text-faint text-center mb-4 font-mono tracking-widest uppercase">
              {t.loginTitle}
            </p>

            {/* Google Sign In */}
            <button
              onClick={signInWithGoogle}
              className="w-full py-3.5 px-5 rounded-xl bg-white border border-line flex items-center justify-center gap-2.5 mb-3 cursor-pointer shadow-sm text-base font-medium text-ink hover:border-line-hi transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path
                  fill="#4285F4"
                  d="M19.99 10.19c0-.82-.07-1.63-.2-2.42H10.2v4.58h5.45c-.24 1.24-.95 2.3-1.99 3l3.24 2.52c1.9-1.75 3-4.33 3-7.68z"
                />
                <path
                  fill="#34A853"
                  d="M10.2 20c2.7 0 4.96-.9 6.62-2.42l-3.24-2.52c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.75-5.59-4.12H1.34v2.6C2.99 17.75 6.35 20 10.2 20z"
                />
                <path
                  fill="#FBBC05"
                  d="M4.61 11.9c-.22-.6-.34-1.24-.34-1.9s.12-1.3.34-1.9V5.5H1.34C.48 7.18 0 9.05 0 11s.48 3.82 1.34 5.5l3.27-2.6z"
                />
                <path
                  fill="#EA4335"
                  d="M10.2 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C14.95.99 12.7 0 10.2 0 6.35 0 2.99 2.25 1.34 5.5l3.27 2.6c.79-2.37 2.99-4.12 5.59-4.12z"
                />
              </svg>
              {t.googleSignIn}
            </button>

            {/* GitHub Sign In */}
            <button
              onClick={signInWithGitHub}
              className="w-full py-3.5 px-5 rounded-xl bg-[#24292F] border-none flex items-center justify-center gap-2.5 cursor-pointer shadow-sm text-base font-medium text-white hover:bg-[#1a1e22] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.07.63-1.31-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10c0-5.523-4.477-10-10-10z" />
              </svg>
              {t.githubSignIn}
            </button>
          </div>
        </div>

        {/* Language Toggle */}
        <div className="px-8 pb-10 flex justify-center gap-2">
          {(["en", "sv"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                "px-4 py-2 rounded-full border-none cursor-pointer text-sm font-semibold transition-colors",
                l === lang
                  ? "bg-accent text-white"
                  : "bg-transparent text-muted"
              )}
            >
              {l === "en" ? t.english : t.swedish}
            </button>
          ))}
        </div>
      </div>
    </MobileWrapper>
  );
}
