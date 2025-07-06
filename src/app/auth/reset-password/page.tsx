'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Create a schema without the token field for the form
const resetPasswordFormSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema)
  });

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid password reset link. No token provided.');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setIsLoading(true);
    setMessage(''); // Clear any previous messages
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(result.message || 'Password reset successfully!');
        // Redirect to signin page after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin?message=Password reset successfully. You can now sign in with your new password.');
        }, 3000);
      } else {
        setStatus('form'); // Stay on form to show error
        setMessage(result.message || 'Password reset failed');
      }
    } catch (error) {
      setStatus('form'); // Stay on form to show error
      setMessage('An unexpected error occurred. Please try again.');
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (status === 'error') {
      return (
        <div className="flex flex-col items-center space-y-4">
          <XCircle className="h-16 w-16 text-red-600" />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500 mb-4">
              The password reset link may have expired or is invalid.
            </p>
          </div>
          <div className="flex space-x-4">
            <Button asChild variant="outline">
              <Link href="/auth/signin">
                Back to Sign In
              </Link>
            </Button>
            <Button asChild>
              <Link href="/auth/forgot-password">
                Request New Link
              </Link>
            </Button>
          </div>
        </div>
      );
    }

    if (status === 'success') {
      return (
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-600" />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting to sign in page in a few seconds...
            </p>
          </div>
          <Button asChild>
            <Link href="/auth/signin">
              Continue to Sign In
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {message && (
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="Enter your new password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              placeholder="Confirm your new password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </Button>

        <div className="text-center">
          <Link
            href="/auth/signin"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Back to Sign In
          </Link>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            💎 JwellX
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Reset Your Password
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}