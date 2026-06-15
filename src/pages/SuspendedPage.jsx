// src/pages/SuspendedPage.jsx
import React from "react";

function SuspendedPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary px-4 font-dm-sans">
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-accent/10 bg-white shadow-2xl shadow-accent/10">
        <div className="h-2 bg-accent" />

        <div className="px-6 py-10 text-center sm:px-10 sm:py-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/10 text-accent">
            <span className="text-4xl font-bold">!</span>
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-accent">Access Restricted</p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
            Service Temporarily Suspended
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-secondary/70">
            Access to Leads CRM has been temporarily suspended because the pending payment has not been settled.
          </p>

          <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-accent/10 bg-primary p-5 text-left">
            <p className="text-sm font-semibold text-secondary">What happens next?</p>
            <p className="mt-2 text-sm leading-6 text-secondary/70">
              Please settle the pending payment to restore access to the system and continue using the CRM services.
            </p>
          </div>

          <div className="mt-8 inline-flex items-center justify-center rounded-full border border-accent/15 bg-accent/5 px-5 py-2 text-sm font-medium text-accent">
            Payment required to restore access
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuspendedPage;
