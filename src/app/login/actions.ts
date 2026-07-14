"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_USERNAME, DEMO_PASSWORD, SESSION_COOKIE } from "@/lib/auth";

export async function login(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const username = formData.get("username");
  const password = formData.get("password");

  if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
    return { error: "Invalid username or password" };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
