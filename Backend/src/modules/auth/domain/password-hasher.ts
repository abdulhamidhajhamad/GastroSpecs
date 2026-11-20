/** Port for one-way password hashing, so use cases never depend on a hashing library. */
export abstract class PasswordHasher {
  abstract hash(plain: string): Promise<string>;
  abstract verify(plain: string, hash: string): Promise<boolean>;
}
