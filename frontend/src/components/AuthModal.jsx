import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye, EyeOff, Loader2, Terminal, User, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AuthModal({ open, onOpenChange, defaultTab = 'login' }) {
  const [isLogin, setIsLogin] = useState(defaultTab === 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(username.trim(), password);
      } else {
        await signup(username.trim(), password);
      }
      onOpenChange(false);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message = err.response?.data?.detail || 
        (isLogin ? 'Invalid username or password' : 'Failed to create account');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-card border-border overflow-hidden">
        {/* Code-style header */}
        <DialogHeader className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
              <Terminal className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {isLogin ? 'Sign In' : 'Create Account'}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isLogin ? 'Access your snippets' : 'Start organizing your code'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5">
          {/* Tab switcher - code style */}
          <div className="flex bg-muted/50 rounded-lg p-1 mb-5 border border-border/50">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={cn(
                "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                isLogin 
                  ? "bg-background shadow-sm text-foreground border border-border/50" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-primary font-mono text-xs">{'>'}</span>
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={cn(
                "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                !isLogin 
                  ? "bg-background shadow-sm text-foreground border border-border/50" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-primary font-mono text-xs">{'+'}</span>
              Sign Up
            </button>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-mono">
              <span className="text-destructive/70">// </span>{error}
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="h-10 bg-muted/30 border-border/50 focus:border-primary font-mono"
                autoComplete="username"
                data-testid="auth-username-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="h-10 bg-muted/30 border-border/50 focus:border-primary pr-10 font-mono"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  data-testid="auth-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="h-10 bg-muted/30 border-border/50 focus:border-primary font-mono"
                  autoComplete="new-password"
                  data-testid="auth-confirm-password-input"
                />
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              data-testid="auth-submit-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  <span className="font-mono mr-2">{isLogin ? '→' : '+'}</span>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </Button>
          </form>
          
          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={switchMode}
              className="text-primary hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;
