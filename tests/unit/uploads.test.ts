import { describe, expect, it } from "vitest";
import { allowedUploadTypes, maxUploadBytes, validatedUpload } from "@/lib/uploads";

describe("upload validation", () => {
  it("accepts configured production-safe upload types", () => {
    expect(allowedUploadTypes.has("application/pdf")).toBe(true);
    expect(maxUploadBytes).toBe(10 * 1024 * 1024);
  });

  it("rejects disallowed file types", async () => {
    const formData = new FormData();
    formData.set("file", new File(["hello"], "script.html", { type: "text/html" }));
    await expect(validatedUpload(formData, "file")).rejects.toThrow("File type is not allowed.");
  });
});
