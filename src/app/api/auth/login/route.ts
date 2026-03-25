import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

  try {
    const { password } = await request.json();

    if (password === ADMIN_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set("admin_auth", ADMIN_PASSWORD, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
