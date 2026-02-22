import { v2 as cloudinary } from "cloudinary";

type UploadResourceType = "image" | "video" | "auto";
const DEFAULT_UPLOAD_TIMEOUT_MS = 120000;
const DEFAULT_UPLOAD_RETRY_COUNT = 1;

function assertCloudinaryEnv(): void {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary configuration. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }
}

let isConfigured = false;

function configureCloudinary(): void {
  if (isConfigured) {
    return;
  }

  assertCloudinaryEnv();
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  isConfigured = true;
}

export type UploadMediaOptions = {
  folder: string;
  resourceType: UploadResourceType;
};

export type UploadMediaResult = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
};

function parseIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function asError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string" && error.trim()) {
    return new Error(error);
  }

  if (error && typeof error === "object") {
    const maybeRecord = error as Record<string, unknown>;
    const message = typeof maybeRecord.message === "string" ? maybeRecord.message : "";
    const details = typeof maybeRecord.error === "string" ? maybeRecord.error : "";
    const httpCode = maybeRecord.http_code;

    const parts = [message, details].filter(Boolean);
    if (parts.length > 0) {
      const suffix = typeof httpCode === "number" ? ` (http_code=${httpCode})` : "";
      return new Error(parts.join(" | ") + suffix);
    }

    try {
      return new Error(`${fallbackMessage}: ${JSON.stringify(maybeRecord)}`);
    } catch {
      // Ignore serialization failures and return generic fallback below.
    }
  }

  return new Error(fallbackMessage);
}

async function uploadMediaBufferOnce(
  fileBuffer: Buffer,
  options: UploadMediaOptions,
  timeoutMs: number
): Promise<UploadMediaResult> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let uploadStream: ReturnType<typeof cloudinary.uploader.upload_stream> | undefined;

    function finishWithError(error: unknown, fallbackMessage = "Cloudinary upload failed.") {
      if (settled) return;
      settled = true;
      reject(asError(error, fallbackMessage));
    }

    function finishWithSuccess(value: UploadMediaResult) {
      if (settled) return;
      settled = true;
      resolve(value);
    }

    const timeout = setTimeout(() => {
      if (settled) return;

      try {
        uploadStream?.destroy(new Error("Cloudinary upload timed out."));
      } catch {
        // Best effort cleanup; timeout error is still returned to caller.
      }

      finishWithError(
        new Error(`Cloudinary upload timed out after ${timeoutMs}ms. Check Cloudinary credentials/network.`)
      );
    }, timeoutMs);

    try {
      uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          resource_type: options.resourceType
        },
        (error, result) => {
          clearTimeout(timeout);

          if (error || !result) {
            finishWithError(error || new Error("Cloudinary upload failed."));
            return;
          }

          finishWithSuccess({
            secureUrl: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
            bytes: result.bytes
          });
        }
      );

      uploadStream.end(fileBuffer);
    } catch (error) {
      clearTimeout(timeout);
      finishWithError(error, "Cloudinary upload failed.");
    }
  });
}

export async function uploadMediaBuffer(
  fileBuffer: Buffer,
  options: UploadMediaOptions
): Promise<UploadMediaResult> {
  configureCloudinary();

  const timeoutMs = parseIntEnv("CLOUDINARY_UPLOAD_TIMEOUT_MS", DEFAULT_UPLOAD_TIMEOUT_MS);
  const retryCount = parseIntEnv("CLOUDINARY_UPLOAD_RETRY_COUNT", DEFAULT_UPLOAD_RETRY_COUNT);
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      return await uploadMediaBufferOnce(fileBuffer, options, timeoutMs);
    } catch (error) {
      const parsedError = asError(error, "Cloudinary upload failed.");
      const timedOut = /timed out/i.test(parsedError.message);
      const hasRetryLeft = attempt < retryCount;

      if (!timedOut || !hasRetryLeft) {
        throw parsedError;
      }

      lastError = parsedError;
      const backoffMs = Math.min(1000 * 2 ** attempt, 5000);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError || new Error("Cloudinary upload failed.");
}
