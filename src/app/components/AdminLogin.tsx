import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield } from 'lucide-react';
import { supabase } from '../../../utils/supabase/client';
import { ADMIN_EMAILS, ADMIN_PASSWORD } from '../constants/admin';

interface AdminLoginProps {
  onBack: () => void;
  onAuthenticated: () => void;
}

export function AdminLogin({ onBack, onAuthenticated }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(ADMIN_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAllowedEmail = ADMIN_EMAILS.includes(email.trim().toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAllowedEmail) {
      setError('This email is not authorized for admin access.');
      return;
    }

    if (password !== ADMIN_PASSWORD) {
      setError('Admin password is incorrect.');
      return;
    }

    setIsSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.message.toLowerCase().includes('email not confirmed')) {
        setError('Email confirmation is still enabled in Supabase. Disable "Confirm email" in Auth settings to allow admin login without verification.');
      } else {
        setError(signInError.message);
      }
    } else {
      onAuthenticated();
    }
    setIsSubmitting(false);
  };

  const handleCreateAdmin = async () => {
    setError(null);
    if (!isAllowedEmail) {
      setError('This email is not authorized for admin access.');
      return;
    }
    if (password !== ADMIN_PASSWORD) {
      setError('Admin password must be Letifi123!.');
      return;
    }
    setIsSubmitting(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setError(signUpError.message);
    } else {
      onAuthenticated();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors mb-10"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft size={18} />
          Back to site
        </motion.button>

        <div className="max-w-xl mx-auto bg-card border border-border rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl" style={{ fontWeight: 700 }}>Admin Login</h1>
              <p className="text-sm text-foreground/70">Authorized access for Letifi Realty staff.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm text-foreground/80">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="name@company.com"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-foreground/80">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-6 border-t border-border pt-6">
            <p className="text-xs text-foreground/60 mb-3">
              First-time admin? Create your account using the approved email and the standard admin password.
            </p>
            <button
              onClick={handleCreateAdmin}
              disabled={isSubmitting}
              className="w-full border border-border rounded-lg py-3 text-sm hover:border-primary/60 transition-colors"
            >
              Create Admin Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
