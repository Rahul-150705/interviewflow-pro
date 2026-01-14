import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import CodeEditor from '@/components/CodeEditor';
import VoiceAssistant from '@/components/VoiceAssistant';
import VoiceChatPanel from './VoiceChatPanel';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2, Mic, MicOff, 
  Clock,
  Save,
 
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
  onComplete: (results: {
    questions: Question[];
    answers: string[];
    feedbacks: FeedbackResult[];
  }) => void;
  onExit: () => void;
}

const CodingInterviewSession = ({
  interview,
  onComplete,
  onExit,
}: CodingInterviewSessionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    new Array(interview.questions.length).fill('')
  );
  const [languages, setLanguages] = useState<string[]>(
    new Array(interview.questions.length).fill('python')
  );
  const [feedbacks, setFeedbacks] = useState<(FeedbackResult | null)[]>(
    new Array(interview.questions.length).fill(null)
  );
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
    const timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentAnswer) return;
    setAutoSaved(false);
    const t = setTimeout(() => setAutoSaved(true), 800);
    return () => clearTimeout(t);
  }, [currentAnswer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
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

    try {
      const result = await api.submitAnswer(
        currentQuestion.id,
        `Language: ${language}\n\n${code}`
      );

      setFeedbacks((f) => {
        const copy = [...f];
        copy[currentIndex] = {
          score: Math.round(result.score),
          aiFeedback: result.aiFeedback,
        };
        return copy;
      });

      setAnswers((a) => {
        const copy = [...a];
        copy[currentIndex] = code;
        return copy;
      });

      setLanguages((l) => {
        const copy = [...l];
        copy[currentIndex] = language;
        return copy;
      });

      toast({ title: 'Solution submitted successfully' });
    } catch (err) {
      toast({
        title: 'Submission failed',
        variant: 'destructive',
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onComplete({
        questions,
        answers: answers.map(
          (a, i) => `Language: ${languages[i]}\n\n${a}`
        ),
        feedbacks: feedbacks.filter(Boolean) as FeedbackResult[],
      });
    }
  };

  const getScoreColor = (score: number) =>
    score >= 80
      ? 'text-success'
      : score >= 60
      ? 'text-warning'
      : 'text-destructive';

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-50 glass-card border-b">
        <div className="flex justify-between items-center px-6 h-16">
          <Button variant="ghost" onClick={onExit}>
            <ArrowLeft className="mr-2" /> Exit Interview
          </Button>

          <div className="flex items-center gap-4">
            <Clock className="w-4 h-4" />
            {formatTime(elapsedTime)}
            {autoSaved && <Save className="w-4 h-4 text-success" />}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-4 py-6 grid lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT */}
        <div className="space-y-6">
          <Progress value={progress} />

          {!currentFeedback ? (
            <CodeEditor
              question={currentQuestion.questionText}
              onSubmit={handleSubmitAnswer}
            />
          ) : (
            <Card>
              <CardContent className="space-y-4 p-6">
                <h2 className="font-semibold">
                  {currentQuestion.questionText}
                </h2>

                <pre className="bg-muted p-4 rounded">
                  {currentAnswer}
                </pre>

                <div>
                  <span
                    className={`text-xl font-bold ${getScoreColor(
                      currentFeedback.score
                    )}`}
                  >
                    {currentFeedback.score}/100
                  </span>
                  <p className="mt-2">{currentFeedback.aiFeedback}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentFeedback && (
            <Button onClick={handleNext}>
              {currentIndex < questions.length - 1
                ? 'Next Question'
                : 'Complete Interview'}
              <ArrowRight className="ml-2" />
            </Button>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-4 sticky top-20 h-fit">
          <VoiceChatPanel interviewId={interview.id} />
        </div>
      </main>
    </div>
  );
};

export default CodingInterviewSession;
