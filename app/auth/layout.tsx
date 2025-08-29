/**
 * Authentication layout for login and signup pages
 * Provides consistent styling and branding for auth pages
 */

import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              KiotViet Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Business Analytics & Management Platform
            </p>
          </div>

          {children}
        </div>
      </div>

      <footer className="text-center text-sm text-muted-foreground p-4">
        © 2024 KiotViet Dashboard. Built with ❤️ for Vietnamese businesses.
      </footer>
    </div>
  );
}
