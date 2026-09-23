const MONGO_ID_PATTERN = /^[a-f0-9]{24}$/i;

/** آی‌دی‌های ساختگی حالت mock (UUID) یا سایر رشته‌ها را از آی‌دی واقعی Mongo جدا می‌کند. */
export function isMongoObjectId(value: string): boolean {
  return MONGO_ID_PATTERN.test(value);
}
