import { Button } from '@/components/ui/button';
import { 
  Brain, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  Users,
  Target,
  Award,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage = ({ onGetStarted, onLogin }: LandingPageProps) => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Questions',
      description: 'Get personalized interview questions tailored to your target role and experience.'
    },
    {
      icon: MessageSquare,
      title: 'Real-time Feedback',
      description: 'Receive instant, detailed feedback on your answers to improve rapidly.'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your improvement over time with detailed analytics and scores.'
    },
    {
      icon: FileText,
      title: 'Resume Analysis',
      description: 'Upload your resume for questions specific to your background.'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Users', icon: Users },
    { value: '50K+', label: 'Interviews', icon: Target },
    { value: '95%', label: 'Success Rate', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      
      {/* Floating Orbs */}
      <div className="fixed top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '3s' }} />
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold gradient-text">MockInterview AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onLogin} className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
              <Button onClick={onGetStarted} className="gradient-primary border-0 text-primary-foreground hover:opacity-90 shadow-glow">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-primary text-sm font-medium mb-8 animate-fade-up border border-primary/30">
              <Sparkles className="w-4 h-4" />
              AI-Powered Interview Preparation
              <Zap className="w-4 h-4" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <span className="text-foreground">Ace Your Next</span>
              <br />
              <span className="gradient-text">Interview with AI</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Practice with AI-generated questions tailored to your dream job. 
              Get instant feedback and improve your interview skills dramatically.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="gradient-hero text-primary-foreground border-0 text-lg px-8 py-6 hover:opacity-90 shadow-glow animate-pulse-glow"
              >
                Start Practicing Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={onLogin}
                className="text-lg px-8 py-6 border-border/50 hover:bg-card hover:border-primary/50"
              >
                I Have an Account
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-8 mt-16 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center glass-card px-6 py-4 rounded-2xl border border-border/50 hover-lift">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-foreground">Everything You Need to </span>
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive interview preparation tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group glass-card p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover-lift animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-foreground">How It </span>
              <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to interview success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload Resume', description: 'Share your resume and target job description for personalized questions', icon: FileText },
              { step: '02', title: 'Practice Interview', description: 'Answer AI-generated questions in a realistic interview simulation', icon: MessageSquare },
              { step: '03', title: 'Get Feedback', description: 'Receive detailed feedback and scores to improve your responses', icon: TrendingUp }
            ].map((item, index) => (
              <div key={index} className="relative glass-card p-8 rounded-2xl border border-border/50 hover:border-primary/50 transition-all hover-lift animate-fade-up" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="absolute -top-4 -left-4 w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold shadow-glow">
                  {item.step}
                </div>
                <div className="pt-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Secure & Private', description: 'Your data is encrypted and never shared with third parties' },
              { icon: Zap, title: 'Instant Results', description: 'Get real-time feedback on your answers as you practice' },
              { icon: Clock, title: '24/7 Available', description: 'Practice anytime, anywhere at your own pace' }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gradient-border rounded-3xl overflow-hidden">
            <div className="glass-card p-8 sm:p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-foreground">Ready to Land Your </span>
                <span className="gradient-text">Dream Job?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of successful candidates who prepared with MockInterview AI
              </p>
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="gradient-hero text-primary-foreground border-0 text-lg px-8 py-6 hover:opacity-90 shadow-glow"
              >
                Start Free Practice Session
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold gradient-text">MockInterview AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MockInterview AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
