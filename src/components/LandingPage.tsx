import { Button } from '@/components/ui/button';
import { 
  Brain, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Users,
  Target,
  Award
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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">InterviewAI</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onLogin}>
                Sign In
              </Button>
              <Button onClick={onGetStarted} className="gradient-primary border-0 text-primary-foreground hover:opacity-90">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-8 animate-fade-up">
              <Sparkles className="w-4 h-4" />
              AI-Powered Interview Preparation
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Ace Your Next Interview with{' '}
              <span className="text-primary">AI Coaching</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Practice with AI-generated questions tailored to your dream job. 
              Get instant feedback and improve your interview skills dramatically.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="gradient-primary text-primary-foreground border-0 text-lg px-8 py-6 hover:opacity-90 shadow-glow"
              >
                Start Practicing Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={onLogin}
                className="text-lg px-8 py-6"
              >
                I Have an Account
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-8 mt-12 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
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
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive interview preparation tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 bg-card rounded-2xl border border-border hover:shadow-lg hover:border-primary/50 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to interview success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload Resume', description: 'Share your resume and target job description for personalized questions' },
              { step: '02', title: 'Practice Interview', description: 'Answer AI-generated questions in a realistic interview simulation' },
              { step: '03', title: 'Get Feedback', description: 'Receive detailed feedback and scores to improve your responses' }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-7xl font-bold text-primary/10 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-8 pl-4">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gradient-hero rounded-3xl p-8 sm:p-12 text-center shadow-glow">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of successful candidates who prepared with InterviewAI
            </p>
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="bg-card text-foreground hover:bg-card/90 text-lg px-8 py-6"
            >
              Start Free Practice Session
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">InterviewAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 InterviewAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
