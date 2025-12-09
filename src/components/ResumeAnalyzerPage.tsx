import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2,
  Loader2,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Award,
  Target,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ResumeAnalyzerPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['summary']);
  const { toast } = useToast();

  const handleFile = (selectedFile: File) => {
    if (!selectedFile) return;

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or Word document.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setAnalysis(null);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const analyzeResume = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please upload a resume first.',
        variant: 'destructive',
      });
      return;
    }

    setAnalyzing(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (jobDescription.trim()) {
        formData.append('jobDescription', jobDescription);
      }

      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user?.id) {
        formData.append('userId', user.id);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/resume-analyzer/analyze', {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: formData
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(error.error || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data);
      
      toast({
        title: 'Analysis complete!',
        description: 'Your resume has been analyzed successfully.',
      });
    } catch (err) {
      clearInterval(interval);
      setUploadProgress(0);
      toast({
        title: 'Analysis failed',
        description: err instanceof Error ? err.message : 'Failed to analyze resume',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setAnalysis(null);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success/20 border-success/30';
    if (score >= 60) return 'bg-warning/20 border-warning/30';
    return 'bg-destructive/20 border-destructive/30';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Resume Analyzer</h1>
            <p className="text-muted-foreground">Get AI-powered insights to improve your resume</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Upload & Job Description */}
        <div className="space-y-6">
          {/* File Upload */}
          <Card className="glass-card border-border/50 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Upload Resume</h2>
              
              {!file ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                    isDragging 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border/50 hover:border-primary/50 hover:bg-card/50'
                  }`}
                >
                  <input
                    type="file"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    accept=".pdf,.doc,.docx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                    <Upload className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Drop your resume here
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    or click to browse from your computer
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, DOC, DOCX up to 10MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 glass-card rounded-xl border border-border/50">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {!analyzing && (
                      <button
                        onClick={removeFile}
                        className="p-2 hover:bg-card rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  {analyzing && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-sm text-center text-muted-foreground">
                        Analyzing... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="glass-card border-border/50 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Job Description (Optional)
              </h2>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to get tailored feedback..."
                className="min-h-[200px] resize-none bg-card border-border/50 focus:border-primary focus:ring-primary/20"
                maxLength={2000}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Helps provide more relevant suggestions</span>
                <span>{jobDescription.length}/2000</span>
              </div>
            </CardContent>
          </Card>

          {/* Analyze Button */}
          <Button
            onClick={analyzeResume}
            disabled={!file || analyzing}
            className="w-full h-12 gradient-primary text-primary-foreground border-0 shadow-glow animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze Resume
              </>
            )}
          </Button>
        </div>

        {/* Right Column - Analysis Results */}
        <div className="space-y-6">
          {!analysis ? (
            <Card className="glass-card border-border/50 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Analysis Yet
                </h3>
                <p className="text-muted-foreground">
                  Upload your resume and click analyze to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 animate-fade-up">
              {/* Score Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className={`glass-card border ${getScoreBg(analysis.overallScore)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Award className={`w-5 h-5 ${getScoreColor(analysis.overallScore)}`} />
                      <span className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                        {analysis.overallScore}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                  </CardContent>
                </Card>

                <Card className={`glass-card border ${getScoreBg(analysis.atsScore)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Target className={`w-5 h-5 ${getScoreColor(analysis.atsScore)}`} />
                      <span className={`text-2xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                        {analysis.atsScore}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">ATS Score</p>
                  </CardContent>
                </Card>

                {analysis.skillsMatch && (
                  <Card className={`glass-card border col-span-2 ${getScoreBg(analysis.skillsMatch)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Zap className={`w-5 h-5 ${getScoreColor(analysis.skillsMatch)}`} />
                        <span className={`text-2xl font-bold ${getScoreColor(analysis.skillsMatch)}`}>
                          {analysis.skillsMatch}%
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">Skills Match</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Summary */}
              {analysis.summary && (
                <Card className="glass-card border-border/50">
                  <CardContent className="p-6">
                    <button
                      onClick={() => toggleSection('summary')}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Summary</h3>
                      </div>
                      {expandedSections.includes('summary') ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    {expandedSections.includes('summary') && (
                      <p className="text-foreground leading-relaxed animate-fade-up">
                        {analysis.summary}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Strengths */}
              <Card className="glass-card border-border/50">
                <CardContent className="p-6">
                  <button
                    onClick={() => toggleSection('strengths')}
                    className="w-full flex items-center justify-between mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <h3 className="text-lg font-semibold text-foreground">Strengths</h3>
                    </div>
                    {expandedSections.includes('strengths') ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  {expandedSections.includes('strengths') && (
                    <ul className="space-y-2 animate-fade-up">
                      {analysis.strengths.map((strength: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                          <span className="text-foreground">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Improvements */}
              <Card className="glass-card border-border/50">
                <CardContent className="p-6">
                  <button
                    onClick={() => toggleSection('improvements')}
                    className="w-full flex items-center justify-between mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-warning" />
                      <h3 className="text-lg font-semibold text-foreground">Areas for Improvement</h3>
                    </div>
                    {expandedSections.includes('improvements') ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  {expandedSections.includes('improvements') && (
                    <ul className="space-y-2 animate-fade-up">
                      {analysis.improvements.map((improvement: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                          <span className="text-foreground">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="glass-card border-border/50">
                <CardContent className="p-6">
                  <button
                    onClick={() => toggleSection('recommendations')}
                    className="w-full flex items-center justify-between mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Recommendations</h3>
                    </div>
                    {expandedSections.includes('recommendations') ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  {expandedSections.includes('recommendations') && (
                    <ul className="space-y-2 animate-fade-up">
                      {analysis.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-foreground">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Missing Keywords */}
              {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
                <Card className="glass-card border-border/50">
                  <CardContent className="p-6">
                    <button
                      onClick={() => toggleSection('keywords')}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        <h3 className="text-lg font-semibold text-foreground">Missing Keywords</h3>
                      </div>
                      {expandedSections.includes('keywords') ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    {expandedSections.includes('keywords') && (
                      <div className="flex flex-wrap gap-2 animate-fade-up">
                        {analysis.missingKeywords.map((keyword: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-destructive/20 text-destructive rounded-full text-sm border border-destructive/30">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzerPage;