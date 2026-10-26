import 'server-only';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { requiredEnv } from '@/lib/env';

function client() {
  return new S3Client({
    region: 'auto', endpoint: `https://${requiredEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: requiredEnv('R2_ACCESS_KEY_ID'), secretAccessKey: requiredEnv('R2_SECRET_ACCESS_KEY') },
    maxAttempts: 3,
  });
}
export async function putImage(key: string, bytes: Uint8Array, mime: string) {
  await client().send(new PutObjectCommand({ Bucket: requiredEnv('R2_BUCKET_NAME'), Key: key, Body: bytes,
    ContentType: mime, CacheControl: 'private, no-store' }));
}
export async function getImage(key: string) {
  return client().send(new GetObjectCommand({ Bucket: requiredEnv('R2_BUCKET_NAME'), Key: key }));
}
export async function deleteImage(key: string) {
  await client().send(new DeleteObjectCommand({ Bucket: requiredEnv('R2_BUCKET_NAME'), Key: key }));
}
