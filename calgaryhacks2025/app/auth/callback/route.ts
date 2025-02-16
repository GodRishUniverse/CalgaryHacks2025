import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    try {
      await supabase.auth.exchangeCodeForSession(code);
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
    } catch (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=AuthCallbackError`
      );
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/login?error=NoCode`);
}
