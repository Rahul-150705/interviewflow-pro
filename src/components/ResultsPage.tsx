import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft,
  Trophy,
  BarChart3,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Play,
  Home,
  Target,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';

interface Question {
  id: string | number;
  questionText: string;
}

interface FeedbackResult {
  score: number;
  aiFeedback: string;
}

interface ResultsPageProps {
  questions: Question[];
  answers: string[];
  feedbacks: FeedbackResult[];
  onNewInterview: () => void;
  onDashboard: () => void;
}

const ResultsPage = ({ questions, answers, feedbacks, onNewInterview, onDashboard }: ResultsPageProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const overallScore = Math.round(
    feedbacks.reduce((acc, f) => acc + f.score, 0) / feedbacks.length
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success/10';
    if (score >= 60) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent!';
    if (score >= 80) return 'Great Job!';
    if (score >= 70) return 'Good Work';
    if (score >= 60) return 'Keep Practicing';
    return 'Needs Improvement';
  };

  const highScoreQuestions = feedbacks.filter(f => f.score >= 80).length;
  const mediumScoreQuestions = feedbacks.filter(f => f.score >= 60 && f.score < 80).length;
  const lowScoreQuestions = feedbacks.filter(f => f.score < 60).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onDashboard}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Score Overview */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Interview Complete!</h1>
          <p className="text-muted-foreground mb-8">Here's how you performed</p>
          
          <Card className="inline-block">
            <CardContent className="p-8">
              <div className={`text-7xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
                {overallScore}
              </div>
              <p className="text-lg text-muted-foreground mb-4">Overall Score</p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getScoreBg(overallScore)} ${getScoreColor(overallScore)}`}>
                <Target className="w-4 h-4" />
                {getScoreLabel(overallScore)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success mb-1">{highScoreQuestions}</div>
              <p className="text-sm text-muted-foreground">Excellent (80+)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning mb-1">{mediumScoreQuestions}</div>
              <p className="text-sm text-muted-foreground">Good (60-79)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive mb-1">{lowScoreQuestions}</div>
              <p className="text-sm text-muted-foreground">Improve (&lt;60)</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Feedback */}
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Detailed Feedback
          </h2>
          
          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card 
                key={question.id}
                className="overflow-hidden transition-shadow hover:shadow-md"
              >
                <CardContent className="p-0">
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    className="w-full p-6 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getScoreBg(feedbacks[index].score)}`}>
                        <span className={`text-lg font-bold ${getScoreColor(feedbacks[index].score)}`}>
                          {feedbacks[index].score}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Question {index + 1}</p>
                        <p className="font-medium text-foreground line-clamp-1">
                          {question.questionText}
                        </p>
                      </div>
                    </div>
                    {expandedIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  
                  {expandedIndex === index && (
                    <div className="px-6 pb-6 space-y-4 animate-fade-up">
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Your Answer
                        </p>
                        <p className="text-foreground">{answers[index]}</p>
                      </div>
                      
                      <div className={`p-4 rounded-xl ${getScoreBg(feedbacks[index].score)}`}>
                        <p className={`text-sm font-medium mb-2 flex items-center gap-2 ${getScoreColor(feedbacks[index].score)}`}>
                          <CheckCircle2 className="w-4 h-4" />
                          AI Feedback
                        </p>
                        <p className="text-foreground">{feedbacks[index].aiFeedback}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <Button 
            variant="outline" 
            size="lg"
            onClick={onDashboard}
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <Button 
            size="lg"
            onClick={onNewInterview}
            className="gradient-primary text-primary-foreground border-0"
          >
            <Play className="w-5 h-5 mr-2" />
            Start New Interview
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
