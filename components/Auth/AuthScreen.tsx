
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Sparkles, Loader2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    try {
      if (isLogin) {
        // Supabase v2 uses signInWithPassword
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // Supabase v2 uses signUp
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMsg("Registration successful! Please wait for an admin to approve your account.");
        setIsLogin(true); 
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-[#212121] transition-colors p-4">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-12 h-12 mb-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
          <Sparkles size={24} className="text-white" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h1>
        
        <div className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
          {isLogin ? (
            <>Don't have an account? <button onClick={() => setIsLogin(false)} className="text-blue-500 hover:underline">Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => setIsLogin(true)} className="text-blue-500 hover:underline">Log in</button></>
          )}
        </div>

        <form onSubmit={handleAuth} className="w-full space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          {msg && (
            <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-md border border-green-200 dark:border-green-800">
              {msg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2f2f2f] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2f2f2f] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? 'Continue' : 'Sign Up')}
          </button>
        </form>
      </div>
    </div>
  );
};
