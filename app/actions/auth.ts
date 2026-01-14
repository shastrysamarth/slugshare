"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function signUp(email: string, password: string, name?: string) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        // Note: In a real app, you'd store the hashed password in a separate table
        // For now, we're just creating the user without password storage
        // You'll need to add a password field to your User model or create a separate Credentials table
      },
    });

    revalidatePath("/");
    return { success: true, user };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}

