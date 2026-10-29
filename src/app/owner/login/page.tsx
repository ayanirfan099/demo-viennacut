import type { Metadata } from "next";
import OwnerLoginForm from "@/components/owner/OwnerLoginForm";

export const metadata: Metadata = {
  title: "Owner Login | Vienna Cuts",
  description: "Secure owner dashboard login for Vienna Cuts.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OwnerLoginPage() {
  return (
    <main lang="en" id="main" className="owner-login">
      <aside className="owner-login-story" aria-label="Studio workspace">
        <p className="eyebrow">VIENNA CUTS / OWNER WORKSPACE</p>
        <div>
          <p className="owner-login-headline">
            Behind the craft.
            <br />
            <em>In control.</em>
          </p>
          <p>
            A considered space for your studio’s day. Appointments, people and
            the details that matter.
          </p>
        </div>
        <p className="eyebrow">PRIVATE ACCESS / FICTIONAL DEMO STUDIO</p>
      </aside>
      <section aria-labelledby="owner-login-title" className="owner-login-card">
        <p className="eyebrow">WELCOME BACK</p>
        <h1 id="owner-login-title">Owner Login</h1>
        <p className="page-deck">
          Sign in to manage your barbershop appointments.
        </p>
        <OwnerLoginForm />
        <p className="fine-print">
          Access is restricted to authorized studio owners.
        </p>
      </section>
    </main>
  );
}
