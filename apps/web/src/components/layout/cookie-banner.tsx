"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@myfundingtrade/ui";
import Link from "next/link";

const CONSENT_KEY = "mft-cookie-consent";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("mft-session-id");
  if (!id) {
    id = "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("mft-session-id", id);
  }
  return id;
}

async function recordCookieConsentServer(prefs: CookiePreferences) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    await fetch(`${API_URL}/api/v1/legal/cookie-consent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: getSessionId(),
        essential: true,
        analytics: prefs.analytics,
        marketing: prefs.marketing,
      }),
    });
  } catch {
    // Non-blocking — consent is stored locally regardless
  }
}

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    recordCookieConsentServer(prefs);
    setShow(false);
  };

  const acceptAll = () => {
    savePreferences({ essential: true, analytics: true, marketing: true });
  };

  const declineOptional = () => {
    savePreferences({ essential: true, analytics: false, marketing: false });
  };

  const saveCustom = () => {
    savePreferences({ essential: true, analytics, marketing });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-50 p-4"
        >
          <div className="section-container">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]/95 px-6 py-4 backdrop-blur-xl">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-slate-400">
                  We use cookies to improve your experience and for analytics.{" "}
                  <Link href="/legal/privacy-policy" className="text-green-400 underline underline-offset-2 hover:text-green-300">
                    Privacy Policy
                  </Link>
                </p>
                <div className="flex shrink-0 items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setShowPreferences(!showPreferences)}>
                    Preferences
                  </Button>
                  <Button variant="ghost" size="sm" onClick={declineOptional}>
                    Decline
                  </Button>
                  <Button size="sm" onClick={acceptAll}>
                    Accept All
                  </Button>
                </div>
              </div>

              {/* Granular cookie preferences */}
              <AnimatePresence>
                {showPreferences && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-3 border-t border-[var(--color-border)] pt-4">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" checked disabled className="h-4 w-4 rounded accent-green-500" />
                        <span className="text-sm text-slate-300">Essential</span>
                        <span className="text-xs text-slate-600">— Always active. Required for the site to function.</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={analytics}
                          onChange={(e) => setAnalytics(e.target.checked)}
                          className="h-4 w-4 rounded accent-green-500"
                        />
                        <span className="text-sm text-slate-300">Analytics</span>
                        <span className="text-xs text-slate-600">— Help us understand how you use the site.</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={marketing}
                          onChange={(e) => setMarketing(e.target.checked)}
                          className="h-4 w-4 rounded accent-green-500"
                        />
                        <span className="text-sm text-slate-300">Marketing</span>
                        <span className="text-xs text-slate-600">— Personalized content and offers.</span>
                      </label>
                      <div className="pt-2">
                        <Button size="sm" onClick={saveCustom}>Save Preferences</Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
