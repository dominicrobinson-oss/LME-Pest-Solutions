export const allowedUploadTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

export const maxUploadBytes = 10 * 1024 * 1024;

export async function validatedUpload(formData: FormData, key: string) {
  const file = formData.get(key);
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > maxUploadBytes) throw new Error("File is too large. Maximum upload size is 10MB.");
  const contentType = file.type || "application/octet-stream";
  if (!allowedUploadTypes.has(contentType)) throw new Error("File type is not allowed.");
  return {
    name: file.name,
    contentType,
    data: Buffer.from(await file.arrayBuffer()),
  };
}
