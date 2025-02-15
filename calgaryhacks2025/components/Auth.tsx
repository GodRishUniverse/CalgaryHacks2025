"use client";

import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

const customTheme = {
  default: {
    colors: {
      brand: "#ec4899", // pink-500
      brandAccent: "#f43f5e", // rose-400
      brandButtonText: "white",
      defaultButtonBackground: "white",
      defaultButtonBackgroundHover: "#fdf2f8", // pink-50
      defaultButtonBorder: "#e5e7eb", // gray-200
      defaultButtonText: "#4b5563", // gray-600
      inputBackground: "white",
      inputBorder: "#e5e7eb", // gray-200
      inputBorderHover: "#ec4899", // pink-500
      inputBorderFocus: "#ec4899", // pink-500
    },
    space: {
      buttonPadding: "12px 16px",
      inputPadding: "12px 16px",
    },
    borderWidths: {
      buttonBorderWidth: "1px",
      inputBorderWidth: "1px",
    },
    radii: {
      borderRadiusButton: "8px",
      buttonBorderRadius: "8px",
      inputBorderRadius: "8px",
    },
    fonts: {
      bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
      buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
      inputFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
    },
  },
};

export default function AuthForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/donate";

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-md">
      <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
        Welcome to WildlifeDAO
      </h2>
      <Auth
        supabaseClient={supabase}
        view="sign_in"
        appearance={{ theme: customTheme }}
        theme="default"
        showLinks={true}
        providers={[]}
        redirectTo={`${window.location.origin}${redirectTo}`}
      />
    </div>
  );
}
