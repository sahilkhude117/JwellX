// app/page.tsx
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gem, Users, TrendingUp, Shield, Clock, BarChart3 } from "lucide-react";
import Link from "next/link";
import { getCurrentSession } from "@/lib/utils/auth-utils";
import { redirect } from "next/navigation";

async function LandingPageContent() {
  const session = await getCurrentSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gem className="h-8 w-8 text-black" />
              <span className="text-2xl font-bold text-black">JwellX</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              ✨ Modern Jewelry POS System
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Jewelry Business
              <span className="block text-black">Made Simple</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Streamline your jewelry store operations with our comprehensive POS system. 
              Manage inventory, track sales, handle customers, and grow your business with ease.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-3">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to run your jewelry store
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful features designed specifically for jewelry businesses
            </p>
          </div>
          
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center">
                  <Gem className="h-8 w-8 text-black" />
                  <CardTitle className="ml-3">Inventory Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track your precious metals, gemstones, and finished jewelry pieces with detailed cataloging and real-time stock updates.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-black" />
                  <CardTitle className="ml-3">Customer Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Maintain detailed customer profiles, purchase history, and preferences to provide personalized service and build lasting relationships.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-black" />
                  <CardTitle className="ml-3">Sales Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get insights into your sales performance, popular items, and business trends with comprehensive reporting and analytics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-black" />
                  <CardTitle className="ml-3">Role-Based Access</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Secure your business with role-based permissions for owners, accountants, artisans, and sales staff.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-black" />
                  <CardTitle className="ml-3">Real-Time Updates</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Stay updated with real-time inventory levels, gold rates, and business operations across all your devices.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-black" />
                  <CardTitle className="ml-3">Financial Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate detailed financial reports, track profitability, and make data-driven decisions for your business growth.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to transform your jewelry business?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of jewelry store owners who trust JwellX to manage their business
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-3">
                  Start Your Free Trial
                </Button>
              </Link>
              <p className="text-sm text-gray-500">
                No credit card required • 14-day free trial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Gem className="h-6 w-6 text-black" />
              <span className="text-xl font-bold text-black">JwellX</span>
            </div>
            <p className="text-gray-600">
              © 2025 JwellX. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LandingPageContent />
    </Suspense>
  );
}