

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrayogLogo = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="24" fill="url(#paint0_linear_1_2)"/>
        <path d="M16 16L24 24L16 32" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 16L32 24L24 32" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
            <linearGradient id="paint0_linear_1_2" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2675FE"/>
                <stop offset="1" stopColor="#1A52B8"/>
            </linearGradient>
        </defs>
    </svg>
);


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await auth.login(email, password);
    setIsLoading(false);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-card shadow-custom-light rounded-lg border border-border">
        <div className="flex flex-col items-center">
          <PrayogLogo />
          <h2 className="mt-4 text-3xl font-extrabold text-foreground font-heading">
            Sign in to Prayog
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back! Please enter your details.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-border rounded-lg placeholder-muted-foreground text-foreground bg-input focus:outline-none focus:ring-primary-main focus:border-primary-main sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password-sr" className="sr-only">Password</label>
                <input
                  id="password-sr"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-border rounded-lg placeholder-muted-foreground text-foreground bg-input focus:outline-none focus:ring-primary-main focus:border-primary-main sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-end mt-4">
                <div className="text-sm">
                    <a href="#" className="font-medium text-primary-main hover:text-primary-dark">
                        Forgot your password?
                    </a>
                </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-error-lighter text-error-dark rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-main hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;