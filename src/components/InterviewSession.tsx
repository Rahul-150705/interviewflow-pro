import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Save
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

interface InterviewSessionProps {
  interview: Interview;
  onComplete: (results: { questions: Question[]; answers: string[]; feedbacks: FeedbackResult[] }) => void;
  onExit: () => void;
}

const InterviewSession = ({ interview, onComplete, onExit }: InterviewSessionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(interview.questions.length).fill(''));
  const [feedbacks, setFeedbacks] = useState<(FeedbackResult | null)[]>(new Array(interview.questions.length).fill(null));
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [autoSaved, setAutoSaved] = useState(false);
  const { toast } = useToast();

  const questions = interview.questions;
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const currentFeedback = feedbacks[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-save indicator
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

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: 'Answer required',
        description: 'Please write your answer before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await api.submitAnswer(currentQuestion.id, currentAnswer);
      const newFeedbacks = [...feedbacks];
      newFeedbacks[currentIndex] = result;
      setFeedbacks(newFeedbacks);
    } catch (err) {
      toast({
        title: 'Submission failed',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Complete interview
      onComplete({
        questions,
        answers,
        feedbacks: feedbacks.filter((f): f is FeedbackResult => f !== null),
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const updateAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = value;
    setAnswers(newAnswers);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onExit}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Exit Interview</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
              {autoSaved && currentAnswer && (
                <div className="flex items-center gap-1 text-success text-sm animate-fade-up">
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

            {/* Question Card */}
            <Card className="mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Interview Question</p>
                    <h2 className="text-xl font-semibold text-foreground leading-relaxed">
                      {currentQuestion.questionText}
                    </h2>
                  </div>
                </div>

                {currentFeedback ? (
                  <div className="animate-scale-in">
                    <div className="p-4 bg-muted/50 rounded-xl mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-muted-foreground">Your Answer</span>
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                      <p className="text-foreground">{currentAnswer}</p>
                    </div>

                    <div className="p-4 bg-accent/50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-muted-foreground">AI Feedback</span>
                        <span className={`text-2xl font-bold ${getScoreColor(currentFeedback.score)}`}>
                          {currentFeedback.score}/100
                        </span>
                      </div>
                      <p className="text-foreground">{currentFeedback.aiFeedback}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Textarea
                      value={currentAnswer}
                      onChange={(e) => updateAnswer(e.target.value)}
                      placeholder="Type your answer here... Take your time to provide a thoughtful response."
                      className="min-h-[200px] resize-none text-base"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {currentAnswer.length} characters
                      </span>
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={loading || !currentAnswer.trim()}
                        className="gradient-primary text-primary-foreground border-0"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          'Submit Answer'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentFeedback && (
                <Button onClick={handleNext} className="gradient-primary text-primary-foreground border-0">
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
            <Card className="sticky top-24 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Questions</h3>
                <div className="space-y-2">
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        index === currentIndex
                          ? 'bg-primary/10 text-primary'
                          : feedbacks[index]
                          ? 'bg-success/10 text-success'
                          : answers[index]
                          ? 'bg-muted text-foreground'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                        index === currentIndex
                          ? 'gradient-primary text-primary-foreground'
                          : feedbacks[index]
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {feedbacks[index] ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </div>
                      <span className="text-sm truncate">
                        {q.questionText.substring(0, 30)}...
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

export default InterviewSession;
