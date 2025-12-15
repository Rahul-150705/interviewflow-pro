import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';
import AuthPage from '@/components/AuthPage';
import DashboardWithSidebar from '@/components/DashboardWithSidebar';
import Dashboard from '@/components/Dashboard';
import ResumeUpload from '@/components/ResumeUpload';
import InterviewSetup from '@/components/InterviewSetup';
import InterviewSession from '@/components/InterviewSession';
import CodingInterviewSession from '@/components/CodingInterviewSession';
import ResultsPage from '@/components/ResultsPage';
import ResumeAnalyzerPage from '@/components/ResumeAnalyzerPage';

type Page = 
  | 'landing' 
  | 'auth' 
  | 'dashboard' 
  | 'resume-upload' 
  | 'interview-setup' 
  | 'interview-session'
  | 'coding-interview-session'
  | 'results'
  | 'ai-interview'
  | 'resume-analyzer';

interface Question {
  id: string | number;
  questionText: string;
}

interface Interview {
  id: string;
  questions: Question[];
  jobTitle: string;
  roundType?: string; // Added roundType to track interview type
}

interface FeedbackResult {
  score: number;
  aiFeedback: string;
}

const Index = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(null);
  const [interviewResults, setInterviewResults] = useState<{
    questions: Question[];
    answers: string[];
    feedbacks: FeedbackResult[];
  } | null>(null);

  const handleStartInterview = () => {
    setCurrentPage('resume-upload');
  };

  const handleResumeUploadContinue = () => {
    setCurrentPage('interview-setup');
  };

  const handleInterviewSetupStart = (interview: Interview) => {
    console.log('=== Interview Started ===');
    console.log('Round Type:', interview.roundType);
    console.log('Job Title:', interview.jobTitle);
    console.log('Questions:', interview.questions.length);
    
    setCurrentInterview(interview);
    
    // ✅ Route to correct interview session based on round type
    if (interview.roundType === 'CODING' || interview.roundType === 'DSA') {
      console.log('✓ Routing to CODING Interview Session (with compiler)');
      setCurrentPage('coding-interview-session');
    } else {
      console.log('✓ Routing to BEHAVIORAL/SYSTEM_DESIGN Interview Session (text-based)');
      setCurrentPage('interview-session');
    }
  };

  const handleInterviewComplete = (results: {
    questions: Question[];
    answers: string[];
    feedbacks: FeedbackResult[];
  }) => {
    setInterviewResults(results);
    setCurrentPage('results');
  };

  const handleNewInterview = () => {
    setCurrentInterview(null);
    setInterviewResults(null);
    setCurrentPage('resume-upload');
  };

  const handleBackToDashboard = () => {
    setCurrentInterview(null);
    setInterviewResults(null);
    setCurrentPage('dashboard');
  };

  const handleViewChange = (view: 'dashboard' | 'ai-interview' | 'resume-analyzer') => {
    setCurrentPage(view);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show landing or auth
  if (!user) {
    if (currentPage === 'auth') {
      return (
        <AuthPage
          onBack={() => setCurrentPage('landing')}
          defaultMode={authMode}
        />
      );
    }

    return (
      <LandingPage
        onGetStarted={() => {
          setAuthMode('register');
          setCurrentPage('auth');
        }}
        onLogin={() => {
          setAuthMode('login');
          setCurrentPage('auth');
        }}
      />
    );
  }

  // Authenticated - show app pages with sidebar for main views
  const mainViews: Page[] = ['dashboard', 'ai-interview', 'resume-analyzer'];
  
  if (mainViews.includes(currentPage)) {
    return (
      <DashboardWithSidebar
        currentView={currentPage as 'dashboard' | 'ai-interview' | 'resume-analyzer'}
        onViewChange={handleViewChange}
      >
        {currentPage === 'dashboard' && (
          <Dashboard onStartInterview={handleStartInterview} />
        )}
        {currentPage === 'ai-interview' && (
          <div className="p-8">
            <Dashboard onStartInterview={handleStartInterview} />
          </div>
        )}
        {currentPage === 'resume-analyzer' && (
          <ResumeAnalyzerPage />
        )}
      </DashboardWithSidebar>
    );
  }

  // Interview flow pages (without sidebar)
  switch (currentPage) {
    case 'resume-upload':
      return (
        <ResumeUpload
          onBack={handleBackToDashboard}
          onContinue={handleResumeUploadContinue}
        />
      );

    case 'interview-setup':
      return (
        <InterviewSetup
          onBack={() => setCurrentPage('resume-upload')}
          onStart={handleInterviewSetupStart}
        />
      );

    case 'interview-session':
      return currentInterview ? (
        <InterviewSession
          interview={currentInterview}
          onComplete={handleInterviewComplete}
          onExit={handleBackToDashboard}
        />
      ) : null;

    case 'coding-interview-session':
      return currentInterview ? (
        <CodingInterviewSession
          interview={currentInterview}
          onComplete={handleInterviewComplete}
          onExit={handleBackToDashboard}
        />
      ) : null;

    case 'results':
      return interviewResults ? (
        <ResultsPage
          questions={interviewResults.questions}
          answers={interviewResults.answers}
          feedbacks={interviewResults.feedbacks}
          interviewId={currentInterview?.id}
          onNewInterview={handleNewInterview}
          onDashboard={handleBackToDashboard}
        />
      ) : null;

    default:
      return (
        <DashboardWithSidebar
          currentView="dashboard"
          onViewChange={handleViewChange}
        >
          <Dashboard onStartInterview={handleStartInterview} />
        </DashboardWithSidebar>
      );
  }
};

export default Index;