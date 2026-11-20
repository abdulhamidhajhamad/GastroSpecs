/** Rules for passwords an admin chooses. Signing in does not check these, so old passwords keep working. */
export const PASSWORD_MIN_LENGTH = 10;
/** bcrypt ignores everything past 72 bytes, so longer passwords would give a false sense of strength. */
export const PASSWORD_MAX_LENGTH = 72;
