import type { Metadata } from "next";
import { Badge } from "@myfundingtrade/ui";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "MyFundingTrade Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="pt-32 pb-20 md:pt-40">
      <div className="section-container max-w-3xl">
        <Badge variant="outline" className="mb-4">Legal</Badge>
        <h1 className="mb-2 text-3xl font-bold text-slate-50 md:text-4xl">Privacy Policy</h1>
        <p className="mb-10 text-sm text-slate-500">Last updated: January 15, 2026</p>

        <div className="prose prose-invert prose-green max-w-none prose-headings:text-slate-50 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-slate-200">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly, such as your name, email address, phone
            number, and payment details when you create an account or purchase a challenge.
          </p>
          <p>
            We also automatically collect certain device and usage information, including IP
            address, browser type, operating system, pages visited, and referring URLs.
          </p>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain our services</li>
            <li>To process transactions and send related information</li>
            <li>To send promotional communications (with your consent)</li>
            <li>To detect, prevent, and address technical issues and fraud</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2>3. Data Sharing</h2>
          <p>
            We do not sell your personal data. We may share information with third-party service
            providers who assist in operating our platform (payment processors, analytics, hosting).
            All third parties are bound by data processing agreements.
          </p>

          <h2>4. Cookies</h2>
          <p>
            We use essential cookies for site functionality and optional analytics cookies to
            improve our services. You can manage cookie preferences through the cookie banner or
            your browser settings.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We retain personal data for as long as your account is active or as needed to provide
            services. After account closure, we retain data for up to 5 years to comply with legal
            and regulatory requirements.
          </p>

          <h2>6. Your Rights</h2>
          <p>
            Depending on your jurisdiction, you may have the right to access, correct, delete, or
            port your data, as well as the right to object to or restrict certain processing. To
            exercise these rights, contact us at privacy@myfundingtrade.com.
          </p>

          <h2>7. Security</h2>
          <p>
            We implement industry-standard security measures including encryption in transit (TLS),
            encryption at rest, and regular security audits to protect your data.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any
            material changes by posting the new policy on this page and updating the &quot;Last
            updated&quot; date.
          </p>

          <h2>9. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at
            privacy@myfundingtrade.com or via our Contact page.
          </p>
        </div>
      </div>
    </section>
  );
}
