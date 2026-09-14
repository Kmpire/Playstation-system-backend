import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { Controller, Route, Tags, Get, Post, Body, Security } from "tsoa";
import { db } from "../database/db.js";
import { users } from "../database/schema.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";
import { seedAccounts } from "../database/seed.js";
import type {
  LoginRequestDto,
  UserPublicDto,
  LoginResponseDto,
  ChangePasswordDto,
  AccountDto,
  UserListResponse,
  UserActionResponse,
  CurrentUserResponse,
} from "../types/auth.types.js";

function createHttpError(statusCode: number, message: string) {
  const err = new Error(message);
  (err as any).statusCode = statusCode;
  return err;
}

@Route("api/v1/auth")
@Tags("Auth")
export class AuthController extends Controller {
  @Post("login")
  public async login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
    const rawUsername = body.username?.trim();
    const password = body.password;
    if (!rawUsername || !password) {
      this.setStatus(400);
      throw createHttpError(400, "اسم المستخدم وكلمة المرور مطلوبان / Username and password are required");
    }

    // Match case-insensitively by username OR display name
    const allUsers = await db.select().from(users);
    const user = allUsers.find(
      (u) =>
        u.username.toLowerCase() === rawUsername.toLowerCase() ||
        (u.name && u.name.toLowerCase() === rawUsername.toLowerCase()),
    );

    if (!user) {
      this.setStatus(401);
      throw createHttpError(401, "اسم المستخدم أو كلمة المرور غير صحيحة / Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      this.setStatus(401);
      throw createHttpError(401, "اسم المستخدم أو كلمة المرور غير صحيحة / Invalid credentials");
    }

    const signOptions: jwt.SignOptions = {};
    if (JWT_EXPIRES_IN && JWT_EXPIRES_IN !== "never" && JWT_EXPIRES_IN !== "none") {
      signOptions.expiresIn = JWT_EXPIRES_IN as any;
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      Object.keys(signOptions).length > 0 ? signOptions : undefined,
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }

  @Post("change-password")
  public async changePassword(@Body() body: ChangePasswordDto): Promise<UserActionResponse> {
    const { username, currentPassword, newPassword } = body;
    if (!username || !newPassword) {
      this.setStatus(400);
      throw new Error("Username and new password are required");
    }

    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) {
      this.setStatus(404);
      throw new Error("User not found");
    }

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        this.setStatus(400);
        throw new Error("Current password is incorrect");
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.username, username));

    return { success: true, message: "Password updated successfully" };
  }

  @Security("bearerAuth")
  @Get("me")
  public async getCurrentUser(): Promise<CurrentUserResponse> {
    // Note: Express middleware handles user resolution
    return {
      success: true,
      user: { id: 1, username: "admin", name: "Admin", role: "admin" },
    };
  }

  @Get("accounts")
  public async getAccounts(): Promise<UserListResponse> {
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users);
    return { success: true, data: allUsers };
  }

  @Post("accounts")
  public async saveAccounts(@Body() accounts: AccountDto[]): Promise<UserActionResponse> {
    for (const acc of accounts) {
      const [existing] = await db.select().from(users).where(eq(users.username, acc.username));
      const password = acc.password ? await bcrypt.hash(acc.password, 10) : undefined;

      if (existing) {
        await db
          .update(users)
          .set({
            name: acc.name || existing.name,
            role: acc.role || existing.role,
            ...(password ? { password } : {}),
            updatedAt: new Date(),
          })
          .where(eq(users.username, acc.username));
      } else if (password) {
        await db.insert(users).values({
          username: acc.username,
          name: acc.name || acc.username,
          role: acc.role || "cashier",
          password,
        });
      }
    }

    return { success: true, message: "Accounts saved successfully" };
  }

  @Post("accounts/reset")
  public async resetAccounts(): Promise<UserActionResponse> {
    await db.delete(users);
    for (const acc of seedAccounts) {
      const hashedPassword = await bcrypt.hash(acc.password, 10);
      await db.insert(users).values({
        username: acc.username,
        name: acc.name,
        role: acc.role,
        password: hashedPassword,
      });
    }
    return { success: true, message: "Accounts reset to defaults" };
  }
}
