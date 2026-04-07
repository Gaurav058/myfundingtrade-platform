"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@myfundingtrade/ui";
import { communityLinks } from "@/data/site";
import { MessageCircle, Users, Video, Camera } from "lucide-react";

const platformIcons: Record<string, React.ElementType> = {
  Discord: MessageCircle,
  Telegram: Users,
  YouTube: Video,
  Instagram: Camera,
};

function getMemberCount(link: (typeof communityLinks)[number]) {
  if ("members" in link && link.members) return link.members;
  if ("subscribers" in link && link.subscribers) return link.subscribers;
  if ("followers" in link && link.followers) return link.followers;
  return "";
}

export function CommunitySection() {
  return (
    <section className="py-20 md:py-28">
      <div className="section-container">
        <SectionHeader
          label="Community"
          title="Join 15,000+ Traders"
          description="Connect with funded traders, share strategies, and stay updated."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {communityLinks.map((link, i) => {
            const Icon = platformIcons[link.platform] ?? Users;
            const count = getMemberCount(link);
            return (
              <motion.a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="glow-card flex flex-col items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 text-center transition-colors hover:border-[var(--color-border-accent)]"
              >
                <Icon className="mb-3 h-8 w-8 text-green-400" />
                <h3 className="mb-1 font-semibold text-slate-50">{link.platform}</h3>
                {count && <p className="text-sm text-slate-400">{count}</p>}
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
