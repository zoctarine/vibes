import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { FileText } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn, signUp, resetPassword, error, loading } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const validatePassword = (pass: string) => {
    if (pass.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isResetPassword) {
      await resetPassword(email);
      setResetSent(true);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (isResetPassword) {
      await resetPassword(email);
      setResetSent(true);
    } else if (isSignUp) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
  };

  const resetForm = () => {
    setIsResetPassword(false);
    setIsSignUp(false);
    setEmail('');
    setPassword('');
    setResetSent(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <FileText size={48} className="text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Draft Editor</h2>
          <p className="mt-2 text-muted-foreground">
            {isResetPassword ? 'Reset your password' : isSignUp ? 'Create an account' : 'Sign in to your account'}
          </p>
        </div>
        
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {resetSent && (
          <div className="p-3 text-sm text-green-600 bg-green-100 dark:bg-green-900/20 rounded-md">
            Check your email for the password reset link
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>

            {!isResetPassword && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  title="Password must be at least 6 characters long"
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </div>
              </div>
            )}
          </div>

          {!isResetPassword && !isSignUp && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsResetPassword(true)}
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
            ) : (
              isResetPassword ? 'Send Reset Link' : isSignUp ? 'Sign Up' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          {isResetPassword ? (
            <button
              onClick={resetForm}
              className="text-sm text-primary hover:underline"
            >
              Back to sign in
            </button>
          ) : (
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};