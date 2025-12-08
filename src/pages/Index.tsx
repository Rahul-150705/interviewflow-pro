import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';
import ResumeUpload from '@/components/ResumeUpload';
import InterviewSetup from '@/components/InterviewSetup';
import InterviewSession from '@/components/InterviewSession';
import ResultsPage from '@/components/ResultsPage';

type AppView = 'landing' | 'auth' | 'dashboard' | 'resume' | 'setup' | 'interview' | 'results';
type AuthMode = 'login' | 'register';

interface Question {
  id: string | number;
  questionText: string;
}

interface Interview {
  id: string;
  questions: Question[];
  jobTitle: string;
}

interface FeedbackResult {
  score: number;
  aiFeedback: string;
}

interface InterviewResults {
  questions: Question[];
  answers: string[];
  feedbacks: FeedbackResult[];
  interviewId: string;
}

const Index = () => {
  const { user, isLoading } = useAuth();
  const [view, setView] = useState<AppView>('landing');
  const [authMode, setAuthMode] = useState<AuthMode>('register');
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(null);
  const [interviewResults, setInterviewResults] = useState<InterviewResults | null>(null);

  // Update view when auth state changes
  useEffect(() => {
    if (!isLoading) {
      if (user && view === 'landing') {
        setView('dashboard');
      }
      if (user && view === 'auth') {
        setView('dashboard');
      }
      if (!user && !['landing', 'auth'].includes(view)) {
        setView('landing');
      }
    }
  }, [isLoading, user, view]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 gradient-primary rounded-xl animate-pulse" />
      </div>
    );
  }

  // Landing page
  if (view === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => {
          setAuthMode('register');
          setView('auth');
        }}
        onLogin={() => {
          setAuthMode('login');
          setView('auth');
        }}
      />
    );
  }

  // Auth page
  if (view === 'auth') {
    return (
      <AuthPage
        onBack={() => setView('landing')}
        defaultMode={authMode}
      />
    );
  }

  // Protected views - require authentication
  if (!user) {
    return (
      <LandingPage
        onGetStarted={() => {
          setAuthMode('register');
          setView('auth');
        }}
        onLogin={() => {
          setAuthMode('login');
          setView('auth');
        }}
      />
    );
  }

  // Dashboard
  if (view === 'dashboard') {
    return (
      <Dashboard
        onStartInterview={() => setView('resume')}
      />
    );
  }

  // Resume upload
  if (view === 'resume') {
    return (
      <ResumeUpload
        onBack={() => setView('dashboard')}
        onContinue={() => setView('setup')}
      />
    );
  }

  // Interview setup
  if (view === 'setup') {
    return (
      <InterviewSetup
        onBack={() => setView('resume')}
        onStart={(interview) => {
          setCurrentInterview(interview);
          setView('interview');
        }}
      />
    );
  }

  // Interview session
  if (view === 'interview' && currentInterview) {
    return (
      <InterviewSession
        interview={currentInterview}
        onComplete={(results) => {
          setInterviewResults({
            ...results,
            interviewId: currentInterview.id
          });
          setView('results');
        }}
        onExit={() => {
          setCurrentInterview(null);
          setView('dashboard');
        }}
      />
    );
  }
  // Results page
  if (view === 'results' && interviewResults) {
    return (
      <ResultsPage
        questions={interviewResults.questions}
        answers={interviewResults.answers}
        feedbacks={interviewResults.feedbacks}
        interviewId={interviewResults.interviewId}
        onNewInterview={() => {
          setCurrentInterview(null);
          setInterviewResults(null);
          setView('resume');
        }}
        onDashboard={() => {
          setCurrentInterview(null);
          setInterviewResults(null);
          setView('dashboard');
        }}
      />
    );
  }
  // Default to dashboard
  return (
    <Dashboard
      onStartInterview={() => setView('resume')}
    />
  );
};

export default Index;