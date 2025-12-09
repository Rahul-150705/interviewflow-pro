import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Brain, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  Zap
} from 'lucide-react';

interface AuthPageProps {
  onBack: () => void;
  defaultMode?: 'login' | 'register';
}

const AuthPage = ({ onBack, defaultMode = 'register' }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      
      {/* Floating Orbs */}
      <div className="fixed top-20 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-20 left-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
        <div className="w-full max-w-sm mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Brain className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">MockInterview AI</h1>
              <p className="text-sm text-muted-foreground">
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </p>
            </div>
          </div>

          {/* Toggle */}
          <div className="flex p-1 glass-card rounded-xl mb-6 border border-border/50">
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isLogin 
                  ? 'gradient-primary text-primary-foreground shadow-glow' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                isLogin 
                  ? 'gradient-primary text-primary-foreground shadow-glow' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2 animate-fade-up">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-11 h-12 bg-card border-border/50 focus:border-primary focus:ring-primary/20"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <Label htmlFor="email" className="text-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-11 h-12 bg-card border-border/50 focus:border-primary focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-11 pr-11 h-12 bg-card border-border/50 focus:border-primary focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-scale-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 gradient-primary text-primary-foreground border-0 text-base font-medium hover:opacity-90 shadow-glow animate-fade-up"
              style={{ animationDelay: '0.3s' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        {/* Additional Orbs */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-background/10 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-background/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="max-w-lg text-center relative z-10">
          <div className="w-24 h-24 bg-background/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float border border-background/20">
            <Brain className="w-14 h-14 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Practice Makes Perfect
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Join thousands of candidates who have improved their interview skills with AI-powered practice sessions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['Software Engineer', 'Product Manager', 'Data Scientist', 'Designer'].map((role, i) => (
              <span 
                key={i}
                className="px-4 py-2 bg-background/10 backdrop-blur-sm rounded-full text-sm text-primary-foreground border border-background/20"
              >
                {role}
              </span>
            ))}
          </div>
          
          {/* Decorative Elements */}
          <div className="flex justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-background/10 backdrop-blur-sm rounded-lg border border-background/20">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm text-primary-foreground">AI Powered</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background/10 backdrop-blur-sm rounded-lg border border-background/20">
              <Zap className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm text-primary-foreground">Instant Feedback</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
