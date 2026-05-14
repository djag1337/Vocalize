import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Vocalize",
  description: "How Vocalize collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <main style={{ background: "#0c0c0e", minHeight: "100vh", color: "#f5f4fa" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#f5f4fa" }}>
          <img src="/logo.jpeg" alt="Vocalize" style={{ width: 36, height: 36, objectFit: "contain", mixBlendMode: "screen" }} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px" }}>Vocalize</span>
        </Link>
        <Link href="/tos" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
          Terms of Service →
        </Link>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 40px 96px" }}>

        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a855f7", marginBottom: 16 }}>
          Legal
        </p>
        <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1.1, margin: "0 0 12px", color: "#f5f4fa" }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 56 }}>
          Last updated: May 14, 2026
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

          <Section title="1. What We Collect">
            When you create an account, we collect your email address, username, and password (stored as a secure hash — we never store your plain-text password). When you use Vocalize, we also collect the content you post, the spaces you join, and basic usage data like when you logged in. We do not collect your location, contacts, or any information from other apps on your device.
          </Section>

          <Section title="2. How We Use It">
            We use your data to operate the platform: to display your posts, show you content from spaces you follow, send you account-related emails (like password resets), and keep the service running. We do not use your data to build advertising profiles. We do not sell your data to third parties. Full stop.
          </Section>

          <Section title="3. What We Don't Do">
            <strong style={{ color: "#f5f4fa" }}>We do not sell your data.</strong> We do not share it with advertisers. We do not use it to train AI models. We do not run automated surveillance on your content. Vocalize is a platform for people, not a data pipeline.
          </Section>

          <Section title="4. Email">
            We send transactional emails only: account verification, password resets, and critical service notices. We do not send marketing emails unless you explicitly opt in. You can opt out of non-essential emails at any time from your account settings.
          </Section>

          <Section title="5. Cookies and Local Storage">
            We use session cookies to keep you logged in. We do not use tracking cookies or third-party analytics cookies. We do not use fingerprinting or any other cross-site tracking technique.
          </Section>

          <Section title="6. Data Storage and Security">
            Your data is stored on servers in the United States. We use industry-standard security practices including encrypted connections (HTTPS), hashed passwords, and access controls. No system is perfectly secure, but we take your data seriously and will notify you promptly if a breach affects your account.
          </Section>

          <Section title="7. Content You Post">
            Posts you make on Vocalize are visible to other users according to the settings of the space they were posted in. If you delete a post, it is removed from public view. We may retain deleted content in backups for a limited period for operational reasons, after which it is purged. We do not re-surface or re-publish deleted content.
          </Section>

          <Section title="8. Third-Party Services">
            Vocalize uses a small number of third-party services to operate: a database provider for data storage, and an email provider for transactional email. These providers process data only as instructed and are bound by their own privacy policies. We do not embed third-party trackers, social widgets, or ad networks into the platform.
          </Section>

          <Section title="9. Your Rights">
            You can access, correct, or delete your account data at any time. To request a full export or permanent deletion of your account and all associated data, contact us at{" "}
            <a href="mailto:privacy@vocalize.social" style={{ color: "#a855f7", textDecoration: "none" }}>
              privacy@vocalize.social
            </a>
            . We will process requests within 30 days.
          </Section>

          <Section title="10. Children">
            Vocalize is not intended for children under 13. We do not knowingly collect personal information from anyone under 13. If you believe a child has created an account, contact us and we will delete it.
          </Section>

          <Section title="11. Changes to This Policy">
            If we make material changes to this policy, we will notify you by email or by posting a notice on the platform before the changes take effect. Continued use of Vocalize after changes constitutes acceptance of the updated policy.
          </Section>

          <Section title="12. Contact">
            For privacy questions or data requests, reach us at:{" "}
            <a href="mailto:privacy@vocalize.social" style={{ color: "#a855f7", textDecoration: "none" }}>
              privacy@vocalize.social
            </a>
          </Section>

        </div>

        <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 24 }}>
          <Link href="/tos" style={{ fontSize: 14, color: "#a855f7", textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Back to Vocalize</Link>
        </div>

      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f5f4fa", margin: "0 0 12px", letterSpacing: "-0.3px" }}>
        {title}
      </h2>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}
