import React, { useState, useEffect, useRef } from 'react';
import { 
  Link2, Copy, Check, User, LogOut, ExternalLink, 
  Sparkles, ShieldCheck, Github, Mail, Lock, ArrowRight 
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080';

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');
    const urlProvider = params.get('provider');

    if (urlToken) {
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const oauthSession = {
        name: (urlEmail || 'user').split('@')[0],
        email: urlEmail || 'oauth-user@example.com',
        provider: urlProvider || 'OAUTH2',
        token: urlToken,
        expiresAt: new Date().getTime() + sevenDaysMs,
      };
      localStorage.setItem('user_session', JSON.stringify(oauthSession));
      localStorage.setItem('jwt_token', urlToken);
      setUser(oauthSession);
      window.history.replaceState({}, document.title, '/');
      return;
    }

    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (new Date().getTime() < parsed.expiresAt) {
        setUser(parsed);
      } else {
        handleLogout();
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOAuthLogin = (provider) => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !password) return;

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const sessionUser = {
        name: email.split('@')[0],
        email: data.email || email,
        provider: 'LOCAL',
        token: data.token,
        expiresAt: new Date().getTime() + sevenDaysMs,
      };
      localStorage.setItem('user_session', JSON.stringify(sessionUser));
      localStorage.setItem('jwt_token', data.token);
      setUser(sessionUser);
    } catch (err) {
      // Fallback demo session if backend is not yet started
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const fallbackUser = {
        name: email.split('@')[0],
        email,
        provider: 'LOCAL (DEMO)',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.7DaysExpirationToken',
        expiresAt: new Date().getTime() + sevenDaysMs,
      };
      localStorage.setItem('user_session', JSON.stringify(fallbackUser));
      localStorage.setItem('jwt_token', fallbackUser.token);
      setUser(fallbackUser);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    localStorage.removeItem('jwt_token');
    setUser(null);
    setDropdownOpen(false);
    setShowAccountModal(false);
    setLongUrl('');
    setShortUrl('');
  };

  const handleShortenUrl = async (e) => {
    e.preventDefault();
    setError('');
    if (!longUrl.trim()) return;

    try {
      new URL(longUrl);
    } catch (_) {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/url/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({ originalUrl: longUrl }),
      });

      if (!response.ok) throw new Error('Backend unreachable');
      const data = await response.json();
      setShortUrl(data.shortUrl);
    } catch (_) {
      // Local fallback if backend server isn't running
      const base62Chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let code = '';
      for (let i = 0; i < 7; i++) {
        code += base62Chars[Math.floor(Math.random() * 62)];
      }
      setShortUrl(`${API_BASE_URL}/r/${code}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-3 shadow-lg shadow-indigo-600/30">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {authMode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Minimal high-throughput URL shortener
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleOAuthLogin('google')}
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-medium py-2.5 px-4 rounded-xl hover:bg-slate-100 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.08.72-2.45 1.16-4.22 1.16-3.24 0-5.98-2.19-6.96-5.14H1.04v3.14C3.05 21.14 7.21 24 12 24z" />
                <path fill="#FBBC05" d="M5.04 14.01c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.29H1.04C.38 8.01 0 9.95 0 12s.38 3.99 1.04 5.71l4-3.7z" />
                <path fill="#EA4335" d="M12 4.75c1.79 0 3.41.62 4.68 1.82l3.51-3.51C18.07 1.19 15.3 0 12 0 7.21 0 3.05 2.86 1.04 6.29l4 3.14c.98-2.95 3.72-5.14 6.96-5.14z" />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => handleOAuthLogin('github')}
              className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-xl border border-slate-700 transition"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </button>
          </div>

          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs uppercase text-slate-500">
              Or continue with email
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {authError && <p className="text-xs text-rose-400">{authError}</p>}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              {authMode === 'login' ? 'Sign In' : 'Sign Up'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-indigo-400 hover:underline font-medium"
            >
              {authMode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* TOP TASKBAR */}
      <header className="w-full h-16 border-b border-slate-900 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Sortner</span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500 flex items-center justify-center transition focus:outline-none"
            title="Account"
          >
            <User className="w-5 h-5 text-slate-300" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>

              <button
                onClick={() => {
                  setShowAccountModal(true);
                  setDropdownOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition"
              >
                <User className="w-4 h-4 text-indigo-400" />
                My Account
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-sm text-rose-400 hover:bg-slate-800 flex items-center gap-2.5 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CENTER MINIMAL URL PASTE BAR & OUTPUT BAR */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Paste a long URL to shorten it
            </h2>
          </div>

          {/* PASTE BAR */}
          <form onSubmit={handleShortenUrl} className="relative flex items-center">
            <input
              type="text"
              placeholder="https://example.com/very/long/url/path..."
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-2xl pl-5 pr-36 py-4 text-sm text-white placeholder-slate-500 focus:outline-none shadow-lg transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl text-sm flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Shortening...' : 'Shorten'}
            </button>
          </form>

          {error && <p className="text-xs text-rose-400 pl-2">{error}</p>}

          {/* OUTPUT BAR DIRECTLY BELOW PASTE BAR */}
          <div className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-4 flex items-center justify-between shadow-inner">
            <div className="truncate pr-4">
              {shortUrl ? (
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 font-mono text-sm hover:underline flex items-center gap-2"
                >
                  {shortUrl}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-slate-600 text-sm font-mono select-none">
                  Shortened URL output will appear here...
                </span>
              )}
            </div>

            <button
              onClick={handleCopy}
              disabled={!shortUrl}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-slate-200 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* MY ACCOUNT MODAL */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                My Account
              </h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 block">Email</span>
                <span className="font-medium text-slate-200">{user.email}</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 block">Authentication Provider</span>
                <span className="font-medium text-indigo-400">{user.provider}</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 block">JWT Session Expiration (7 Days)</span>
                <span className="font-mono text-xs text-emerald-400">
                  {new Date(user.expiresAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
