import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  Loader2,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResumeUploadProps {
  onBack: () => void;
  onContinue: () => void;
}

const ResumeUpload = ({ onBack, onContinue }: ResumeUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = async (selectedFile: File) => {
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
    setUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      await api.uploadResume(selectedFile);
      clearInterval(interval);
      setUploadProgress(100);
      setUploaded(true);
      toast({
        title: 'Resume uploaded!',
        description: 'Your resume has been uploaded successfully.',
      });
    } catch (err) {
      clearInterval(interval);
      setUploadProgress(0);
      setFile(null);
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Failed to upload resume',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
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

  const removeFile = () => {
    setFile(null);
    setUploaded(false);
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {['Resume', 'Job Details', 'Interview'].map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index === 0 
                  ? 'gradient-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              <span className={`hidden sm:inline text-sm font-medium ${
                index === 0 ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step}
              </span>
              {index < 2 && (
                <div className="w-12 h-0.5 bg-muted mx-2" />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">Upload Your Resume</h1>
          <p className="text-muted-foreground">
            We'll use your resume to generate personalized interview questions (optional)
          </p>
        </div>

        <Card className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-8">
            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <input
                  type="file"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
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
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {uploaded ? (
                    <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                  ) : uploading ? (
                    <Loader2 className="w-6 h-6 text-primary animate-spin shrink-0" />
                  ) : (
                    <button
                      onClick={removeFile}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}

                {uploaded && (
                  <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-lg animate-scale-in">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Resume uploaded successfully!</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <Button variant="outline" onClick={onContinue}>
            Skip for now
          </Button>
          <Button 
            onClick={onContinue} 
            className="gradient-primary text-primary-foreground border-0"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ResumeUpload;
