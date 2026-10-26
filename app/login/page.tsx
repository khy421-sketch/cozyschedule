'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Sparkles, Heart } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createClient();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split('@')[0],
              display_name: username || email.split('@')[0],
            },
          },
        });
        if (error) throw error;
        alert('회원가입 완료! 로그인해 주세요.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || '인증 과정에서 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card-3d w-full max-w-md p-8 bg-white relative overflow-hidden">
        <div className="flex justify-center items-center gap-2 mb-6">
          <Sparkles className="w-8 h-8 text-pink-400 animate-pulse" />
          <h1 className="text-3xl font-bold text-slate-800">CozySchedule</h1>
          <Heart className="w-6 h-6 text-yellow-400 fill-yellow-300" />
        </div>

        <p className="text-center text-slate-500 mb-8 font-medium">
          {isSignUp ? '귀여운 공유 스케줄러 시작하기' : '반가워요! 로그인해주세요.'}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 text-sm rounded-2xl border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">사용자 ID (Username)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="예: cozy_user"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-pink-300 focus:outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">이메일</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@cozy.com"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-pink-300 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">비밀번호</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-pink-300 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 btn-3d bg-pink-300 hover:bg-pink-400 text-slate-800 font-bold text-lg rounded-2xl transition"
          >
            {loading ? '처리 중...' : isSignUp ? '가입하기 🌸' : '로그인하기 ✨'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-bold text-slate-500 hover:text-pink-500 underline underline-offset-4"
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </div>
      </div>
    </div>
  );
}
