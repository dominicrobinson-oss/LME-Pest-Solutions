"use client";

import { useEffect } from "react";

export function OfflineFormDraft({ formId, storageKey }: { formId: string; storageKey: string }) {
  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const values = JSON.parse(saved) as Record<string, string>;
      for (const [name, value] of Object.entries(values)) {
        const field = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | RadioNodeList | null;
        if (!field || field instanceof RadioNodeList || field instanceof HTMLInputElement && field.type === "file") continue;
        field.value = value;
      }
    }
    const save = () => {
      const data = new FormData(form);
      const values: Record<string, string> = {};
      for (const [key, value] of data.entries()) {
        if (value instanceof File) continue;
        values[key] = String(value);
      }
      localStorage.setItem(storageKey, JSON.stringify(values));
    };
    const clear = () => localStorage.removeItem(storageKey);
    form.addEventListener("input", save);
    form.addEventListener("change", save);
    form.addEventListener("submit", clear);
    return () => {
      form.removeEventListener("input", save);
      form.removeEventListener("change", save);
      form.removeEventListener("submit", clear);
    };
  }, [formId, storageKey]);

  return <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm font-bold text-amber-800">This treatment form autosaves a private draft on this device until it is submitted.</p>;
}
