// app/auth/forgot-password/page.tsx
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/app/components/auth/forgot-password-form";
import { Gem } from "lucide-react";
import Link from "next/link";

function ForgotPasswordContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Gem className="h-8 w-8 text-black" />
            <span className="text-2xl font-bold text-black">JwellX</span>
          </Link>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}