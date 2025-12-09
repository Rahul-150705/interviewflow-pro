import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { 
  ArrowLeft,
  ArrowRight,
  Briefcase,
  FileText,
  Loader2,
  Sparkles,
  Zap,
  Lightbulb
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

interface InterviewSetupProps {
  onBack: () => void;
  onStart: (interview: Interview) => void;
}

const InterviewSetup = ({ onBack, onStart }: InterviewSetupProps) => {
  const [formData, setFormData] = useState({ jobTitle: '', jobDescription: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jobTitle.trim()) {
      toast({
        title: 'Job title required',
        description: 'Please enter the job title you want to practice for.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const data = await api.startInterview(formData.jobTitle, formData.jobDescription);
      onStart(data);
    } catch (err) {
      toast({
        title: 'Failed to start interview',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const maxDescriptionLength = 2000;
  const descriptionLength = formData.jobDescription.length;

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {['Resume', 'Job Details', 'Interview'].map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index <= 1 
                  ? 'gradient-primary text-primary-foreground shadow-glow' 
                  : 'glass-card border border-border/50 text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              <span className={`hidden sm:inline text-sm font-medium ${
                index <= 1 ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step}
              </span>
              {index < 2 && (
                <div className={`w-12 h-0.5 mx-2 ${index < 1 ? 'bg-primary' : 'bg-border/50'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-8 animate-fade-up">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Briefcase className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-foreground">Set Up Your </span>
            <span className="gradient-text">Interview</span>
          </h1>
          <p className="text-muted-foreground">
            Tell us about the job you're preparing for
          </p>
        </div>

        <Card className="glass-card border-border/50 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="flex items-center gap-2 text-foreground">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Job Title
                </Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="h-12 bg-card border-border/50 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription" className="flex items-center gap-2 text-foreground">
                  <FileText className="w-4 h-4 text-primary" />
                  Job Description (Optional)
                </Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the job description here for more relevant questions..."
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  maxLength={maxDescriptionLength}
                  className="min-h-[200px] resize-none bg-card border-border/50 focus:border-primary focus:ring-primary/20"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Adding a job description helps generate more relevant questions</span>
                  <span className={descriptionLength > maxDescriptionLength * 0.9 ? 'text-warning' : ''}>
                    {descriptionLength}/{maxDescriptionLength}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !formData.jobTitle.trim()}
                className="w-full h-12 gradient-hero text-primary-foreground border-0 text-base font-medium hover:opacity-90 shadow-glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Interview
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="mt-8 glass-card p-6 rounded-2xl border border-border/50 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Tips for better questions</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-primary" />
                  Be specific with the job title (e.g., "Senior Frontend Engineer" vs "Developer")
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-primary" />
                  Include the full job description for industry-specific questions
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-primary" />
                  Mention any specific technologies or skills required
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewSetup;
