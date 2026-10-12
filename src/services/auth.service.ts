import bcrypt from 'bcryptjs';
import { User, IUserDocument } from '../models/user.model.js';
import { RegisterInput } from '../validators/auth.validator.js';
import { AppError } from '../utils/app-error.js';
import { signToken } from '../utils/token.js';

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  public static async register(input: RegisterInput): Promise<{ user: IUserDocument; token: string }> {
    const { email, password } = input;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    try {
      const user = await User.create({
        email,
        password:passwordHash,
      });

      const token = signToken({ userId: user._id.toString() });

      return { user, token };
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000) {
        throw new AppError('An account with this email already exists', 409);
      }
      throw error;
    }
  }
}