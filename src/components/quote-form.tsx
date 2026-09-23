"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { services } from "@/lib/data";

const options = {
  propertyType: ["Domestic", "Commercial", "Landlord", "Letting agent", "Other"],
  urgency: ["Emergency", "Today", "This week", "Flexible"],
  contact: ["Phone", "Email", "WhatsApp"],
};

export function QuoteForm({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setState("loading");
    setMessage("");
    const response = await fetch("/api/leads", { method: "POST", body: formData });
    const payload = await response.json();
    if (!response.ok) {
      setState("error");
      setMessage(payload.error || "Please check the form and try again.");
      return;
    }
    setState("success");
    setMessage("Thanks. Your enquiry has been logged and LME can follow up from the lead dashboard.");
  }

  return (
    <form action={submit} className="grid gap-4" aria-label="Quote enquiry form">
      <div className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        <Field name="name" label="Name" autoComplete="name" />
        <Field name="phone" label="Phone number" autoComplete="tel" />
        <Field name="email" label="Email" type="email" autoComplete="email" />
        <Field name="postcode" label="Postcode" autoComplete="postal-code" />
        <Select name="propertyType" label="Property type" values={options.propertyType} />
        <Select name="pestProblem" label="Pest problem" values={services.map((service) => service.name)} />
        <Select name="urgency" label="Urgency" values={options.urgency} />
        <Select name="preferredContactMethod" label="Preferred contact" values={options.contact} />
      </div>
      <label>
        <span className="label">Short description</span>
        <textarea className="field min-h-28" name="description" placeholder="Tell us what you have seen and where." />
      </label>
      <label className="flex gap-3 text-sm text-slate-700">
        <input className="mt-1 size-4" name="consent" type="checkbox" />
        <span>I consent to LME Pest Solutions contacting me about this enquiry and storing the details for follow-up.</span>
      </label>
      <button className="btn-primary w-full" disabled={state === "loading"} type="submit">
        <Send size={18} />
        {state === "loading" ? "Sending..." : "Submit Enquiry"}
      </button>
      {message ? (
        <p className={state === "success" ? "rounded-lg bg-green-50 p-3 text-sm font-bold text-green-800" : "rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800"}>
          {message}
        </p>
      ) : null}
    </form>
  );
}

function Field({ label, name, type = "text", autoComplete }: { label: string; name: string; type?: string; autoComplete?: string }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="field" name={name} type={type} autoComplete={autoComplete} required={name !== "email"} />
    </label>
  );
}

function Select({ label, name, values }: { label: string; name: string; values: string[] }) {
  return (
    <label>
      <span className="label">{label}</span>
      <select className="field" name={name} required defaultValue="">
        <option value="" disabled>Choose...</option>
        {values.map((value) => <option value={value} key={value}>{value}</option>)}
      </select>
    </label>
  );
}
