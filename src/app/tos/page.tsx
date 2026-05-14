import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Vocalize",
  description: "Vocalize terms of service and community rules.",
};

export default function TermsPage() {
  return (
    <main style={{ background: "#0c0c0e", minHeight: "100vh", color: "#f5f4fa" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#f5f4fa" }}>
          <img src="/logo.jpeg" alt="Vocalize" style={{ width: 36, height: 36, objectFit: "contain", mixBlendMode: "screen" }} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px" }}>Vocalize</span>
        </Link>
        <Link href="/privacy" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
          Privacy Policy →
        </Link>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 40px 96px" }}>

        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a855f7", marginBottom: 16 }}>
          Legal
        </p>
        <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1.1, margin: "0 0 12px", color: "#f5f4fa" }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 56 }}>
          Last updated: May 14, 2026
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

          <Section title="1. Acceptance of Terms">
            By creating an account or using Vocalize (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. We may update these terms from time to time — continued use after changes constitutes acceptance.
          </Section>

          <Section title="2. Who Can Use Vocalize">
            You must be at least 13 years old to use Vocalize. By using the Service, you represent that you meet this requirement. If you are under 18, you represent that a parent or guardian has reviewed and agreed to these terms on your behalf.
          </Section>

          <Section title="3. Your Account">
            You are responsible for keeping your login credentials secure. You are responsible for all activity that occurs under your account. Notify us immediately if you believe your account has been compromised. We reserve the right to suspend or terminate accounts that violate these terms.
          </Section>

          <Section title="4. Content You Post">
            You retain ownership of content you post on Vocalize. By posting, you grant Vocalize a non-exclusive, royalty-free, worldwide license to display, distribute, and store your content as part of operating the Service. You are solely responsible for content you post. Do not post content that:
            <ul>
              <li>Is illegal or facilitates illegal activity</li>
              <li>Harasses, threatens, or targets individuals</li>
              <li>Contains malware, spam, or deceptive material</li>
              <li>Violates the intellectual property rights of others</li>
              <li>Sexualises or exploits minors in any way</li>
              <li>Impersonates another person or organisation</li>
            </ul>
          </Section>

          <Section title="5. Moderation">
            Vocalize uses human moderators, not automated AI systems, to review reported content. Each Space sets its own community rules in addition to these platform-wide terms. Moderators may remove content or restrict accounts that violate community rules or these terms. If content is removed, you will be notified of the reason. You may appeal moderation decisions by contacting us.
          </Section>

          <Section title="6. What We Don't Do">
            Vocalize does not sell your data to advertisers. Vocalize does not use AI to automatically moderate or remove your posts. Vocalize does not shadow-ban — if your content is restricted, you will know about it. We believe in transparency.
          </Section>

          <Section title="7. Service Availability">
            We aim to keep Vocalize available and running, but we do not guarantee uninterrupted service. We may update, modify, or discontinue features at any time. We are not liable for any loss resulting from service interruptions.
          </Section>

          <Section title="8. Limitation of Liability">
            To the maximum extent permitted by law, Vocalize is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability to you shall not exceed the amount you paid us in the past 12 months (which, for free accounts, is zero).
          </Section>

          <Section title="9. Governing Law">
            These terms are governed by the laws of the United States. Any disputes shall be resolved in the courts of the applicable jurisdiction.
          </Section>

          <Section title="10. Contact">
            If you have questions about these terms or need to report a legal issue, contact us at:{" "}
            <a href="mailto:legal@vocalize.social" style={{ color: "#a855f7", textDecoration: "none" }}>
              legal@vocalize.social
            </a>
          </Section>

        </div>

        <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 24 }}>
          <Link href="/privacy" style={{ fontSize: 14, color: "#a855f7", textDecoration: "none" }}>Privacy Policy</Link>
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
