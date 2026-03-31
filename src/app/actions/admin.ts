"use server";

import { cookies } from "next/headers";

export async function loginAdminAction(password: string) {
  // Read Master Password safely from internal env hidden variables
  const adminPass = process.env.ADMIN_PASSWORD;

  if (password === adminPass && adminPass) {
    // Inject the God-Mode cookie exclusively for the /admin route
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "verified_god_mode", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/", // So actions anywhere can test for God Mode
      maxAge: 60 * 60 * 8, // 8 hours duration
    });
    return { success: true };
  } else {
    return { error: "Acceso Denegado. Contraseña maestra incorrecta." };
  }
}

export async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "verified_god_mode";
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}
