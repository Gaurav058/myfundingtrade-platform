"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Globe } from "lucide-react";

interface RegionNoticeProps {
  className?: string;
}

/**
 * Checks the user's region against the geo-restriction API.
 * Displays a warning banner when the service is restricted in their region.
 */
export function RegionNotice({ className = "" }: RegionNoticeProps) {
  const [restricted, setRestricted] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    async function checkRegion() {
      try {
        // Use Cloudflare's CF-IPCountry header or fallback to a default
        // The restrictions endpoint checks the country code server-side
        const res = await fetch(`/api/v1/restrictions/countries`);
        if (!res.ok) return;
        const data = await res.json();
        // If the API returns a list of restricted countries, compare with user's country
        // For now, the component checks if the response indicates restriction
        if (data?.restricted) {
          setRestricted(true);
          setReason(data.reason || null);
        }
      } catch {
        // Fail open — don't block the UI
      }
    }
    checkRegion();
  }, []);

  if (!restricted) return null;

  return (
    <div className={`rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Globe className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div>
          <p className="text-sm font-medium text-amber-300">
            Service may not be available in your region
          </p>
          <p className="mt-1 text-xs text-amber-400/70">
            {reason ||
              "Due to regulatory restrictions, some services may be limited in your jurisdiction. Please review our terms of service for details."}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline maintenance / platform restriction notice.
 * Checks a specific platform restriction key.
 */
export function PlatformNotice({ restrictionKey, className = "" }: { restrictionKey: string; className?: string }) {
  const [notice, setNotice] = useState<{ enabled: boolean; description: string | null } | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch(`/api/v1/restrictions/platform/${restrictionKey}/check`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.data?.enabled) {
          setNotice({ enabled: true, description: data.data.description });
        }
      } catch {
        // Fail open
      }
    }
    check();
  }, [restrictionKey]);

  if (!notice?.enabled) return null;

  return (
    <div className={`rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
        <div>
          <p className="text-sm font-medium text-yellow-300">Platform Notice</p>
          <p className="mt-1 text-xs text-yellow-400/70">
            {notice.description || "This feature is currently restricted. Please check back later."}
          </p>
        </div>
      </div>
    </div>
  );
}
