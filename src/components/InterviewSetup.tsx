import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { 
  ArrowLeft,
  Briefcase,
  FileText,
  Loader2,
  Sparkles,
  Lightbulb,
  Users,
  Code,
  Database,
  Network
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

type RoundType = 'BEHAVIORAL' | 'CODING' | 'DSA' | 'SYSTEM_DESIGN';

const InterviewSetup = ({ onBack, onStart }: InterviewSetupProps) => {
  const [formData, setFormData] = useState({ 
    jobTitle: '', 
    jobDescription: '',
    roundType: '' as RoundType | ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const rounds = [
    {
      type: 'BEHAVIORAL' as RoundType,
      title: 'Behavioral',
      description: 'Leadership, teamwork & problem-solving',
      icon: Users,
      gradient: 'from-primary/20 to-primary/5',
      iconBg: 'bg-primary/20',
      borderColor: 'border-primary/30'
    },
    {
      type: 'CODING' as RoundType,
      title: 'Coding',
      description: 'Practical coding & implementation',
      icon: Code,
      gradient: 'from-primary/20 to-primary/5',
      iconBg: 'bg-primary/20',
      borderColor: 'border-primary/30'
    },
    {
      type: 'DSA' as RoundType,
      title: 'DSA',
      description: 'Data structures & algorithms',
      icon: Database,
      gradient: 'from-primary/20 to-primary/5',
      iconBg: 'bg-primary/20',
      borderColor: 'border-primary/30'
    },
    {
      type: 'SYSTEM_DESIGN' as RoundType,
      title: 'System Design',
      description: 'Architecture & scalability',
      icon: Network,
      gradient: 'from-primary/20 to-primary/5',
      iconBg: 'bg-primary/20',
      borderColor: 'border-primary/30'
    }
  ];

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

    if (!formData.roundType) {
      toast({
        title: 'Round type required',
        description: 'Please select an interview round type.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const data = await api.startInterview(
        formData.jobTitle, 
        formData.jobDescription,
        formData.roundType
      );
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
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
            Select interview round and provide job details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Interview Round Selection */}
          <Card className="glass-card border-border/50 animate-fade-up overflow-hidden">
            <CardContent className="p-6">
              <Label className="text-lg font-semibold text-foreground mb-6 block">
                Select Interview Round
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {rounds.map((round) => {
                  const Icon = round.icon;
                  const isSelected = formData.roundType === round.type;
                  
                  return (
                    <button
                      key={round.type}
                      type="button"
                      onClick={() => setFormData({ ...formData, roundType: round.type })}
                      className={`
                        group relative flex flex-col items-center p-5 rounded-2xl text-center transition-all duration-300 overflow-hidden
                        ${isSelected 
                          ? 'bg-primary/10 border-2 border-primary shadow-glow scale-[1.02]' 
                          : 'bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-primary/5'
                        }
                      `}
                    >
                      {/* Background glow effect */}
                      <div className={`absolute inset-0 bg-gradient-to-b ${round.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isSelected ? 'opacity-100' : ''}`} />
                      
                      {/* Icon container */}
                      <div className={`relative z-10 w-14 h-14 rounded-xl ${round.iconBg} flex items-center justify-center mb-3 transition-all duration-300 ${isSelected ? 'bg-primary shadow-glow' : 'group-hover:bg-primary/30'}`}>
                        <Icon className={`w-7 h-7 transition-colors duration-300 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                      </div>
                      
                      {/* Title */}
                      <h3 className="relative z-10 font-semibold text-foreground text-sm mb-1">{round.title}</h3>
                      
                      {/* Description */}
                      <p className="relative z-10 text-xs text-muted-foreground leading-tight">{round.description}</p>
                      
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-20">
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-glow">
                            <svg className="w-3 h-3 text-primary-foreground" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card className="glass-card border-border/50 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6 space-y-6">
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
                  className="min-h-[150px] resize-none bg-card border-border/50 focus:border-primary focus:ring-primary/20"
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
                disabled={loading || !formData.jobTitle.trim() || !formData.roundType}
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
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="glass-card p-6 rounded-2xl border border-border/50 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Tips for better preparation</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Behavioral:</strong> Use the STAR method (Situation, Task, Action, Result)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Coding:</strong> Think out loud and explain your approach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>DSA:</strong> Discuss time and space complexity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>System Design:</strong> Start with requirements and constraints</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default InterviewSetup;