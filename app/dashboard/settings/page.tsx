"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavHeader from "@/components/layout/nav-header";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useZone } from "@/hooks/use-zone";
import { ZoneBadge } from "@/components/ui/zone-badge";
import { supabase } from "@/lib/supabase/client";
import {
  ChevronRight,
  Bell,
  Globe,
  MapPin,
  LogOut,
  Mail,
  Shield,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { t, lang, setLang } = useLanguage();
  const { signOut } = useAuth();
  const { zone } = useZone();
  const [user, setUser] = useState<{
    email: string;
    name: string;
    avatar?: string;
  } | null>(null);
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    weeklySummary: true,
    taskReminders: false,
  });
  const [, setSavingNotifications] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          email: authUser.email || "",
          name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
          avatar: authUser.user_metadata?.avatar_url,
        });

        // Load notification preferences from profile
        const { data } = await supabase
          .from("profiles")
          .select("notify_tips, notify_weekly")
          .eq("id", authUser.id)
          .single();

        if (data) {
          setNotifications({
            priceAlerts: data.notify_tips ?? true,
            weeklySummary: data.notify_weekly ?? true,
            taskReminders: false, // No DB column yet; keep local
          });
        }
      }
    }
    loadUser();
  }, []);

  const toggleNotification = async (key: keyof typeof notifications) => {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);

    // Sync to Supabase profile
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      setSavingNotifications(true);
      const update: { notify_tips?: boolean; notify_weekly?: boolean } = {};
      if (key === "priceAlerts") update.notify_tips = next.priceAlerts;
      if (key === "weeklySummary") update.notify_weekly = next.weeklySummary;
      // taskReminders has no DB column yet; skip sync
      if (Object.keys(update).length > 0) {
        await supabase
          .from("profiles")
          .update(update)
          .eq("id", authUser.id);
      }
      setSavingNotifications(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <NavHeader title={t.settings} />

      <div className="px-5 pt-2 pb-24">
        {/* Profile Card */}
        <div className="bg-card rounded-[20px] p-5 mb-5 shadow-sm border border-line">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-xl font-serif font-bold text-accent">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-lg font-semibold text-ink">
                {user?.name || "User"}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <ZoneBadge code={zone} />
                <span className="text-xs text-muted">
                  {t.zones[zone]?.city}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="mb-5">
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2 px-1">
            {t.account}
          </h3>
          <div className="bg-card rounded-[20px] shadow-sm border border-line overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
              <Mail size={18} className="text-muted" />
              <div className="flex-1">
                <p className="text-sm text-ink">{user?.email || "..."}</p>
                <p className="text-xs text-faint">Google Account</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/zone/")}
              className="w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer hover:bg-paper-2/50 transition-colors"
            >
              <MapPin size={18} className="text-muted" />
              <div className="flex-1">
                <p className="text-sm text-ink">{t.changeArea}</p>
                <p className="text-xs text-faint">
                  {t.zones[zone]?.city} — {zone}
                </p>
              </div>
              <ChevronRight size={16} className="text-faint" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-5">
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2 px-1">
            {t.notifications}
          </h3>
          <div className="bg-card rounded-[20px] shadow-sm border border-line overflow-hidden">
            {[
              {
                key: "priceAlerts" as const,
                icon: Bell,
                title: "Price Alerts",
                desc: "Notify when price drops below threshold",
              },
              {
                key: "weeklySummary" as const,
                icon: Shield,
                title: "Weekly Summary",
                desc: "Every Sunday at 18:00",
              },
              {
                key: "taskReminders" as const,
                icon: Bell,
                title: "Task Reminders",
                desc: "Remind before optimal windows",
              },
            ].map((item, i, arr) => (
              <div
                key={item.key}
                className={`flex items-center gap-3 px-5 py-4 ${
                  i < arr.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <item.icon size={18} className="text-muted" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink">{item.title}</p>
                  <p className="text-xs text-faint">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggleNotification(item.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    notifications[item.key] ? "bg-accent" : "bg-paper-2"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifications[item.key]
                        ? "translate-x-5"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="mb-5">
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2 px-1">
            {t.language}
          </h3>
          <div className="bg-card rounded-[20px] shadow-sm border border-line overflow-hidden">
            {(["en", "sv"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer hover:bg-paper-2/50 transition-colors ${
                  l === "en" ? "border-b border-line" : ""
                }`}
              >
                <Globe size={18} className="text-muted" />
                <span className="text-sm text-ink flex-1">
                  {l === "en" ? t.english : t.swedish}
                </span>
                {lang === l && (
                  <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 7l3 3 5-6"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-[20px] bg-card border border-line text-bad font-medium text-sm hover:bg-bad/5 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          {t.signOut}
        </button>

        {/* Version */}
        <p className="text-center text-xs text-faint mt-6">{t.version}</p>
      </div>
    </div>
  );
}
