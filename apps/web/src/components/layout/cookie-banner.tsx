"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@myfundingtrade/ui";
import Link from "next/link";

const CONSENT_KEY = "mft-cookie-consent";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setShow(false);
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
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#1a1f36] bg-[#0c1020]/95 px-6 py-4 backdrop-blur-xl sm:flex-row">
              <p className="text-sm text-slate-400">
                We use cookies to improve your experience.{" "}
                <Link href="/legal/privacy-policy" className="text-green-400 underline underline-offset-2 hover:text-green-300">
                  Privacy Policy
                </Link>
              </p>
              <div className="flex shrink-0 items-center gap-3">
                <Button variant="ghost" size="sm" onClick={decline}>
                  Decline
                </Button>
                <Button size="sm" onClick={accept}>
                  Accept
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
