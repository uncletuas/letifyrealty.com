import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { supabase } from '../../../utils/supabase/client';
import { projectId } from '../../../utils/supabase/info';
import { fetchJson } from '../../../utils/api';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    gender: '',
    age: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'sign-in') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          setError(signInError.message);
        } else {
          onSuccess?.();
        }
      } else {
        const ageValue = Number(formData.age);
        if (!formData.gender || !formData.address || !ageValue || Number.isNaN(ageValue) || ageValue < 18) {
          setError('You must be 18 or older and provide gender and address to sign up.');
          setIsSubmitting(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              gender: formData.gender,
              age: ageValue,
              address: formData.address,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
        } else {
          if (data.session?.access_token) {
            const result = await fetchJson<{ success?: boolean; error?: string }>(
              `https://${projectId}.supabase.co/functions/v1/server/profiles`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${data.session.access_token}`,
                },
                body: JSON.stringify({
                  fullName: formData.fullName,
                  gender: formData.gender,
                  age: ageValue,
                  address: formData.address,
                }),
              }
            );
            if (!result.ok) {
              console.error('Error creating profile:', result.data?.error || result.errorText);
            }
            await supabase.auth.signOut();
          }
          setSuccessMessage('Account created successfully! Please sign in with your email and password.');
          setMode('sign-in');
          setFormData({
            email: formData.email,
            password: '',
            fullName: '',
            gender: '',
            age: '',
            address: '',
          });
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-8 shadow-2xl"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl" style={{ fontWeight: 700 }}>
                {mode === 'sign-in' ? 'Welcome Back' : 'Create Your Account'}
              </h2>
              <p className="text-sm text-foreground/70">
                Access your profile, requests, purchases, and updates.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'sign-up' && (
              <>
                <div>
                  <label className="block mb-2 text-sm text-foreground/80">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-foreground/80">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm text-foreground/80">Age</label>
                  <input
                    type="number"
                    name="age"
                    min={18}
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="18"
                    required
                  />
                  <p className="text-xs text-foreground/60 mt-1">Applicants must be 18 or older.</p>
                </div>
                <div>
                  <label className="block mb-2 text-sm text-foreground/80">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Street, City, State"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label className="block mb-2 text-sm text-foreground/80">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-foreground/80">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Create a secure password"
                required
              />
            </div>
            {mode === 'sign-up' && (
              <p className="text-xs text-foreground/60">
                By creating an account, you agree to our{' '}
                <a href="/terms" className="text-primary hover:text-accent transition-colors">
                  Terms &amp; Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary hover:text-accent transition-colors">
                  Privacy Policy
                </a>
                .
              </p>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600">
                {successMessage}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              {isSubmitting
                ? 'Please wait...'
                : mode === 'sign-in'
                  ? 'Sign In'
                  : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
              className="w-full text-sm text-primary hover:text-accent transition-colors"
            >
              {mode === 'sign-in' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
