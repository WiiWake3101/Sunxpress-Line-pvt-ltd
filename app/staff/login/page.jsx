'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';

export default function StaffLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        // Check if user is staff
        const { data: staffData } = await supabaseClient
          .from('office_staff')
          .select('*')
          .eq('email', session.user.email)
          .eq('is_active', true)
          .single();
        
        if (staffData) {
          router.push('/staff/dashboard');
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) throw authError;

      // Check if user is active staff
      const { data: staffData, error: staffError } = await supabaseClient
        .from('office_staff')
        .select('*')
        .eq('email', email.trim())
        .eq('is_active', true)
        .single();

      if (staffError || !staffData) {
        await supabaseClient.auth.signOut();
        throw new Error('Access denied. Please contact administrator.');
      }

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => router.push('/staff/dashboard'), 1500);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1F3C] via-[#1a3a52] to-[#0f2847] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#A0E9E5] to-transparent opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#437A96] to-transparent opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <img
                src="/logo/logo.png"
                alt="Sun Xpress Logo"
                className="h-12 sm:h-14 md:h-16 w-auto drop-shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0D1F3C] to-[#437A96] bg-clip-text text-transparent mb-2">
              Staff Portal
            </h1>
            <p className="text-gray-600 font-medium">Sun Xpress Line</p>
            <div className="h-1 bg-gradient-to-r from-[#A0E9E5] to-[#437A96] w-24 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100/50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100/50 border-l-4 border-green-500 rounded-r-lg">
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold bg-gradient-to-r from-[#0D1F3C] to-[#437A96] bg-clip-text text-transparent mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@sunxp.in"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0E9E5] transition bg-gray-50/50 hover:bg-white placeholder:text-gray-500 placeholder:font-semibold text-black"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold bg-gradient-to-r from-[#0D1F3C] to-[#437A96] bg-clip-text text-transparent mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0E9E5] transition bg-gray-50/50 hover:bg-white placeholder:text-gray-500 placeholder:font-semibold text-black pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#437A96] transition text-sm font-semibold"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0D1F3C] to-[#437A96] text-white py-3 rounded-lg font-semibold hover:from-[#0a1528] hover:to-[#35638a] disabled:opacity-50 transition duration-300 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-xs bg-gradient-to-r from-[#0D1F3C] to-[#437A96] bg-clip-text text-transparent font-medium">
              © 2025 Sun Xpress Line
            </p>
            <p className="text-center text-xs text-gray-400 mt-1">Staff Portal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
