import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PasswordHasher } from "../domain/password-hasher";

/** Cost 12 ≈ a few hundred ms per hash: slow enough to resist guessing, fast enough for sign-in. */
const COST = 12;

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, COST);
  }

  verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
