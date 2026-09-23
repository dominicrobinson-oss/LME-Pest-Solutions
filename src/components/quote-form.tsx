"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { homeMaintenanceServices, services } from "@/lib/data";

const options = {
  propertyType: ["Domestic", "Commercial", "Landlord", "Letting agent", "Other"],
  urgency: ["Emergency", "Today", "This week", "Flexible"],
  contact: ["Phone", "Email", "WhatsApp"],
};

type PresetService = { category: "pest" | "maintenance"; name: string };

export function QuoteForm({ compact = false, presetService }: { compact?: boolean; presetService?: PresetService }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<"pest" | "maintenance">(presetService?.category ?? "pest");

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
      <div>
        <span className="label">What do you need help with?</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`rounded-lg border px-3 py-2 text-sm font-black transition ${category === "pest" ? "border-[var(--primary-gold)] bg-amber-50 text-slate-900" : "border-[var(--border)] text-slate-600"}`}
            onClick={() => setCategory("pest")}
            type="button"
          >
            Pest Control
          </button>
          <button
            className={`rounded-lg border px-3 py-2 text-sm font-black transition ${category === "maintenance" ? "border-[var(--primary-gold)] bg-amber-50 text-slate-900" : "border-[var(--border)] text-slate-600"}`}
            onClick={() => setCategory("maintenance")}
            type="button"
          >
            Home Maintenance
          </button>
        </div>
      </div>
      <div className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        <Field name="name" label="Name" autoComplete="name" />
        <Field name="phone" label="Phone number" autoComplete="tel" />
        <Field name="email" label="Email" type="email" autoComplete="email" />
        <Field name="postcode" label="Postcode" autoComplete="postal-code" />
        <Select name="propertyType" label="Property type" values={options.propertyType} />
        {category === "pest" ? (
          <Select
            key="pest"
            name="pestProblem"
            label="Pest problem"
            values={services.map((service) => service.name)}
            defaultValue={presetService?.category === "pest" ? presetService.name : ""}
          />
        ) : (
          <Select
            key="maintenance"
            name="pestProblem"
            label="Maintenance service"
            values={homeMaintenanceServices.map((service) => service.name)}
            defaultValue={presetService?.category === "maintenance" ? presetService.name : ""}
          />
        )}
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
      <input className="field" name={name} type={type} autoComplete={autoComplete} required />
    </label>
  );
}

function Select({ label, name, values, defaultValue = "" }: { label: string; name: string; values: string[]; defaultValue?: string }) {
  return (
    <label>
      <span className="label">{label}</span>
      <select className="field" name={name} required defaultValue={defaultValue}>
        <option value="" disabled>Choose...</option>
        {values.map((value) => <option value={value} key={value}>{value}</option>)}
      </select>
    </label>
  );
}
