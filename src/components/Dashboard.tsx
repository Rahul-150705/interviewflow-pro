import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Download, Loader2 } from 'lucide-react'; 
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  LogOut, 
  Play, 
  History, 
  BarChart3,
  Target,
  Clock,
  ChevronRight,
  User,
  Settings,
  Sparkles,
  Zap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Interview {
  id: string;
  jobTitle: string;
  jobDescription: string;
  startedAt: string;
  questionCount?: number;
  averageScore?: number;
}

interface DashboardProps {
  onStartInterview: () => void;
}

const Dashboard = ({ onStartInterview }: DashboardProps) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getInterviewHistory();
      setInterviews(data.interviews || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (interviewId: string) => {
    setDownloadingId(interviewId);
    try {
      await api.downloadInterviewPdf(interviewId);
      toast({
        title: 'Download successful',
        description: 'Interview report has been downloaded.',
      });
    } catch (err) {
      toast({
        title: 'Download failed',
        description: err instanceof Error ? err.message : 'Failed to download PDF',
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const totalInterviews = interviews.length;
  const averageScore = interviews.length > 0 
    ? Math.round(interviews.reduce((acc, i) => acc + (i.averageScore || 0), 0) / interviews.length)
    : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-foreground">{getGreeting()}, </span>
            <span className="gradient-text">{user?.name || 'there'}!</span>
            <span className="text-foreground"> 👋</span>
          </h1>
          <p className="text-muted-foreground">
            Ready to practice your interview skills? Let's get started.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="glass-card border-border/50 hover:border-primary/50 transition-all hover-lift animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Interviews</p>
                  <p className="text-3xl font-bold text-foreground">{totalInterviews}</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50 hover:border-success/50 transition-all hover-lift animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-foreground">{averageScore}%</p>
                </div>
                <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50 hover:border-warning/50 transition-all hover-lift animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Practice Time</p>
                  <p className="text-3xl font-bold text-foreground">{totalInterviews * 15}m</p>
                </div>
                <div className="w-12 h-12 bg-warning/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Interview CTA */}
        <Card className="gradient-border rounded-2xl overflow-hidden mb-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <CardContent className="p-0">
            <div className="gradient-hero p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left flex items-center gap-4">
                  <div className="w-16 h-16 bg-background/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-background/20 animate-float">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-primary-foreground mb-2">
                      Ready for your next interview?
                    </h2>
                    <p className="text-primary-foreground/80">
                      Practice with AI-generated questions tailored to your target role.
                    </p>
                  </div>
                </div>
                <Button 
                  size="lg"
                  onClick={onStartInterview}
                  className="bg-background text-foreground hover:bg-background/90 shrink-0 shadow-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start New Interview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interview History */}
        <div className="animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Recent Interviews</h2>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="glass-card border-border/50">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted/50 rounded w-1/3 mb-2 animate-shimmer" />
                    <div className="h-4 bg-muted/50 rounded w-1/4 animate-shimmer" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : interviews.length === 0 ? (
            <Card className="glass-card border-border/50">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No interviews yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your first mock interview to see your history here.
                </p>
                <Button onClick={onStartInterview} className="gradient-primary text-primary-foreground border-0 shadow-glow">
                  <Play className="w-4 h-4 mr-2" />
                  Start First Interview
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {interviews.slice(0, 5).map((interview, index) => (
                <Card 
                  key={interview.id} 
                  className="glass-card border-border/50 hover:border-primary/50 transition-all group hover-lift"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground truncate">
                            {interview.jobTitle}
                          </h3>
                          <span className="px-2.5 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-medium shrink-0 border border-primary/30">
                            {interview.questionCount || 0} questions
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(interview.startedAt).toLocaleDateString()}
                          </span>
                          {interview.averageScore && (
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-4 h-4" />
                              Score: {interview.averageScore}%
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPdf(interview.id)}
                          disabled={downloadingId === interview.id}
                          className="shrink-0 border-border/50 hover:border-primary/50 hover:bg-primary/10"
                        >
                          {downloadingId === interview.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </>
                          )}
                        </Button>
                        
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {interviews.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Showing 5 of {interviews.length} interviews
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
