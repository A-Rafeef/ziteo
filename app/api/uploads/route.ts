import { bucket, owner, route, storeFor } from "@/app/server/data";
import { ApiError, sniffImage } from "@/app/server/validation";

export async function POST(request: Request) {
  return route(async () => {
    const store = await storeFor(await owner());
    if (Number(request.headers.get("content-length") ?? 0) > 6 * 1024 * 1024) throw new ApiError("Choose an image smaller than 5 MB.", 413);
    let form: FormData;
    try { form = await request.formData(); } catch { throw new ApiError("Upload an image using the file field."); }
    const file = form.get("file");
    if (!file || typeof file === "string" || !(file instanceof Blob)) throw new ApiError("Choose an image to upload.");
    if (file.size === 0 || file.size > 5 * 1024 * 1024) throw new ApiError("Choose an image between 1 byte and 5 MB.", 413);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = sniffImage(bytes);
    if (!mime || (file.type && file.type !== mime)) throw new ApiError("Use a JPEG, PNG or WebP image. This file’s contents do not match a supported image type.");
    const extension = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
    const key = `${store.id}/${crypto.randomUUID()}.${extension}`;
    // Images are resized and compressed by the client before this validated storage step.
    await bucket().put(key, bytes, { httpMetadata: { contentType: mime, cacheControl: "public, max-age=31536000, immutable" }, customMetadata: { storeId: store.id } });
    return { url: `/api/images/${key}` };
  }, 201, request);
}
