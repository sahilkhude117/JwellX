// app/auth/error/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Gem } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Gem className="h-8 w-8 text-black" />
            <span className="text-2xl font-bold text-black">JwellX</span>
          </Link>
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Authentication Error</CardTitle>
            <CardDescription className="text-center">
              There was a problem with your authentication request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              This could be due to an invalid link, expired session, or server error.
            </p>
            <div className="flex flex-col space-y-2">
              <Link href="/auth/signin">
                <Button className="w-full">
                  Try signing in again
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Go back to home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}