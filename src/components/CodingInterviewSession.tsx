import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import CodeEditor from '@/components/CodeEditor';
import { 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Save,
  Code
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface CodingInterviewSessionProps {
  interview: Interview;
  onComplete: (results: { questions: Question[]; answers: string[]; feedbacks: FeedbackResult[] }) => void;
  onExit: () => void;
}

const CodingInterviewSession = ({ interview, onComplete, onExit }: CodingInterviewSessionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(interview.questions.length).fill(''));
  const [languages, setLanguages] = useState<string[]>(new Array(interview.questions.length).fill('python'));
  const [feedbacks, setFeedbacks] = useState<(FeedbackResult | null)[]>(new Array(interview.questions.length).fill(null));
  const [elapsedTime, setElapsedTime] = useState(0);
  const [autoSaved, setAutoSaved] = useState(false);
  const { toast } = useToast();

  const questions = interview.questions;
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const currentLanguage = languages[currentIndex];
  const currentFeedback = feedbacks[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentAnswer) {
      setAutoSaved(false);
      const timeout = setTimeout(() => {
        setAutoSaved(true);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentAnswer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitAnswer = async (code: string, language: string) => {
    if (!code.trim()) {
      toast({
        title: 'Code required',
        description: 'Please write your solution before submitting.',
        variant: 'destructive',
      });
      return;
    }

    // Combine code and language in answer
    const fullAnswer = `Language: ${language}\n\n${code}`;

    try {
      const result = await api.submitAnswer(currentQuestion.id, fullAnswer);
      const newFeedbacks = [...feedbacks];
      newFeedbacks[currentIndex] = {
        score: Math.round(result.score),
        aiFeedback: result.aiFeedback
      };
      setFeedbacks(newFeedbacks);

      // Update answers and languages
      const newAnswers = [...answers];
      newAnswers[currentIndex] = code;
      setAnswers(newAnswers);

      const newLanguages = [...languages];
      newLanguages[currentIndex] = language;
      setLanguages(newLanguages);

      toast({
        title: 'Solution submitted!',
        description: 'Your code has been evaluated.',
      });
    } catch (err) {
      toast({
        title: 'Submission failed',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete({
        questions,
        answers: answers.map((code, i) => `Language: ${languages[i]}\n\n${code}`),
        feedbacks: feedbacks.filter((f): f is FeedbackResult => f !== null),
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      
      {/* Floating Orbs */}
      <div className="fixed top-40 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onExit}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Exit Interview</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground glass-card px-3 py-1.5 rounded-lg border border-border/50">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
              {autoSaved && currentAnswer && (
                <div className="flex items-center gap-1 text-success text-sm animate-fade-up glass-card px-3 py-1.5 rounded-lg border border-success/30">
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Progress */}
            <div className="mb-6 animate-fade-up">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}% complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Code Editor or Feedback */}
            {!currentFeedback ? (
              <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <CodeEditor
                  question={currentQuestion.questionText}
                  onSubmit={handleSubmitAnswer}
                />
              </div>
            ) : (
              <Card className="glass-card border-border/50 mb-6 animate-scale-in">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shrink-0 shadow-glow">
                      <Code className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Question</p>
                      <h2 className="text-xl font-semibold text-foreground leading-relaxed">
                        {currentQuestion.questionText}
                      </h2>
                    </div>
                  </div>

                  <div className="p-4 glass-card rounded-xl border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">Your Solution</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full border border-primary/30">
                          {currentLanguage}
                        </span>
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                    </div>
                    <pre className="text-sm font-mono text-foreground bg-card p-3 rounded-lg border border-border/50 overflow-x-auto">
                      {currentAnswer}
                    </pre>
                  </div>

                  <div className="p-4 glass-card rounded-xl border border-primary/30 bg-primary/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">AI Feedback</span>
                      </div>
                      <span className={`text-2xl font-bold ${getScoreColor(currentFeedback.score)}`}>
                        {currentFeedback.score}/100
                      </span>
                    </div>
                    <p className="text-foreground">{currentFeedback.aiFeedback}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="border-border/50 hover:border-primary/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentFeedback && (
                <Button onClick={handleNext} className="gradient-primary text-primary-foreground border-0 shadow-glow">
                  {currentIndex < questions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Complete Interview
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar - Question Navigator */}
          <div className="w-full lg:w-72 shrink-0">
            <Card className="sticky top-24 glass-card border-border/50 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary" />
                  Coding Questions
                </h3>
                <div className="space-y-2">
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        index === currentIndex
                          ? 'glass-card border border-primary/50 text-primary'
                          : feedbacks[index]
                          ? 'glass-card border border-success/30 text-success'
                          : answers[index]
                          ? 'glass-card border border-border/50 text-foreground'
                          : 'hover:bg-card text-muted-foreground'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                        index === currentIndex
                          ? 'gradient-primary text-primary-foreground shadow-glow'
                          : feedbacks[index]
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {feedbacks[index] ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </div>
                      <span className="text-sm truncate">
                        Problem {index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodingInterviewSession;