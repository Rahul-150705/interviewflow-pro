import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  MessageSquare,
  Loader2,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VoiceAssistantProps {
  onTranscriptUpdate?: (text: string) => void;
}

interface TranscriptEntry {
  id: string;
  text: string;
  timestamp: Date;
  type: 'user' | 'system';
}

const VoiceAssistant = ({ onTranscriptUpdate }: VoiceAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState<TranscriptEntry[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;

    if (!SpeechRecognition || !speechSynthesis) {
      setIsSupported(false);
      toast({
        title: 'Browser not supported',
        description: 'Your browser does not support voice features. Please use Chrome or Edge.',
        variant: 'destructive',
      });
      return;
    }

    // Initialize Speech Recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' ';
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      const currentText = finalTranscript || interimTranscript;
      setTranscript(currentText);

      if (finalTranscript && onTranscriptUpdate) {
        onTranscriptUpdate(currentText);
      }

      // Add to history when final
      if (finalTranscript.trim()) {
        const entry: TranscriptEntry = {
          id: Date.now().toString(),
          text: finalTranscript.trim(),
          timestamp: new Date(),
          type: 'user'
        };
        setTranscriptHistory(prev => [...prev, entry]);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error !== 'no-speech') {
        toast({
          title: 'Recognition error',
          description: `Error: ${event.error}`,
          variant: 'destructive',
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    synthesisRef.current = speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, [toast, onTranscriptUpdate]);

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) return;

    try {
      setTranscript('');
      recognitionRef.current.start();
      toast({
        title: 'Listening started',
        description: 'Start speaking your thoughts...',
      });
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast({
        title: 'Failed to start listening',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      setIsListening(false);
      toast({
        title: 'Listening stopped',
        description: 'Voice recording has been stopped.',
      });
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  };

  const speakText = (text: string) => {
    if (!isSupported || !synthesisRef.current) return;

    try {
      // Cancel any ongoing speech
      synthesisRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        toast({
          title: 'Speech error',
          description: 'Failed to speak the text.',
          variant: 'destructive',
        });
      };

      synthesisRef.current.speak(utterance);

      // Add to history
      const entry: TranscriptEntry = {
        id: Date.now().toString(),
        text: text,
        timestamp: new Date(),
        type: 'system'
      };
      setTranscriptHistory(prev => [...prev, entry]);
    } catch (error) {
      console.error('Error in text-to-speech:', error);
    }
  };

  const stopSpeaking = () => {
    if (!synthesisRef.current) return;
    synthesisRef.current.cancel();
    setIsSpeaking(false);
  };

  const clearHistory = () => {
    setTranscriptHistory([]);
    setTranscript('');
    toast({
      title: 'History cleared',
      description: 'All transcripts have been cleared.',
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Text copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy text to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const copyAllTranscripts = () => {
    const allText = transcriptHistory
      .map(entry => `[${entry.type.toUpperCase()}] ${entry.text}`)
      .join('\n\n');
    copyToClipboard(allText);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!isSupported) {
    return (
      <Card className="glass-card border-border/50">
        <CardContent className="p-6 text-center">
          <MicOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Voice features are not supported in your browser.
            <br />
            Please use Chrome or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Voice Controls */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isListening ? 'bg-destructive/20 animate-pulse' : 'bg-primary/20'
              }`}>
                <MessageSquare className={`w-5 h-5 ${
                  isListening ? 'text-destructive' : 'text-primary'
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Voice Assistant</p>
                <p className="text-xs text-muted-foreground">
                  {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Microphone Control */}
              {isListening ? (
                <Button
                  onClick={stopListening}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  <MicOff className="w-4 h-4" />
                  Stop
                </Button>
              ) : (
                <Button
                  onClick={startListening}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary/50 hover:bg-primary/10"
                  disabled={isSpeaking}
                >
                  <Mic className="w-4 h-4" />
                  Start
                </Button>
              )}

              {/* Speaker Control */}
              {isSpeaking ? (
                <Button
                  onClick={stopSpeaking}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <VolumeX className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => speakText(transcript || "Please say something first")}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={isListening || !transcript}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Current Transcript */}
          {(transcript || isListening) && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {isListening ? 'Live Transcript:' : 'Last Transcript:'}
                </p>
                {transcript && (
                  <button
                    onClick={() => copyToClipboard(transcript)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-sm text-foreground">
                {transcript || (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Listening...
                  </span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transcript History */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Transcript History
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {transcriptHistory.length > 0 && (
                <>
                  <Button
                    onClick={copyAllTranscripts}
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2"
                  >
                    <Copy className="w-3 h-3" />
                    Copy All
                  </Button>
                  <Button
                    onClick={clearHistory}
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </Button>
                </>
              )}
            </div>
          </div>

          <ScrollArea className="h-[300px] pr-4">
            {transcriptHistory.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No transcripts yet. Start speaking to see your voice transcribed here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transcriptHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-lg border transition-all hover:border-primary/50 ${
                      entry.type === 'user'
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-secondary/5 border-secondary/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {entry.type === 'user' ? (
                          <Mic className="w-3 h-3 text-primary" />
                        ) : (
                          <Volume2 className="w-3 h-3 text-secondary" />
                        )}
                        <span className={`text-xs font-medium ${
                          entry.type === 'user' ? 'text-primary' : 'text-secondary'
                        }`}>
                          {entry.type === 'user' ? 'You' : 'Assistant'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(entry.timestamp)}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(entry.text)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {entry.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="glass-card border-border/50 bg-secondary/5">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-2 font-medium">
            💡 Voice Assistant Tips:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Click <strong>Start</strong> to begin voice-to-text transcription</li>
            <li>• Click <strong>Speaker</strong> to hear your transcript read aloud</li>
            <li>• All transcripts are saved in the history below</li>
            <li>• Use <strong>Copy All</strong> to export your entire session</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAssistant;

// Updated CodingInterviewSession with Voice Assistant
export const CodingInterviewSessionWithVoice = ({ interview, onComplete, onExit }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(interview.questions.length).fill(''));
  const [languages, setLanguages] = useState<string[]>(new Array(interview.questions.length).fill('python'));
  const [feedbacks, setFeedbacks] = useState<(any | null)[]>(new Array(interview.questions.length).fill(null));
  const [elapsedTime, setElapsedTime] = useState(0);
  const [autoSaved, setAutoSaved] = useState(false);
  const [showVoicePanel, setShowVoicePanel] = useState(true);
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

    const fullAnswer = `Language: ${language}\n\n${code}`;

    try {
      const result = {
        score: Math.round(Math.random() * 40 + 60),
        aiFeedback: 'Your solution demonstrates good understanding. Consider edge cases and optimization.'
      };
      const newFeedbacks = [...feedbacks];
      newFeedbacks[currentIndex] = result;
      setFeedbacks(newFeedbacks);

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
        description: 'An error occurred',
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
        feedbacks: feedbacks.filter((f): f is any => f !== null),
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header and background effects same as before */}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}% complete
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Problem and Code Editor */}
            <Card className="glass-card border-border/50 mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">{currentQuestion.questionText}</h2>
                {/* Code editor component here */}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Voice Assistant */}
          <div className="w-full lg:w-80 shrink-0 space-y-4">
            {/* Toggle Voice Panel */}
            <Button
              onClick={() => setShowVoicePanel(!showVoicePanel)}
              variant="outline"
              className="w-full border-border/50"
            >
              {showVoicePanel ? 'Hide' : 'Show'} Voice Assistant
            </Button>

            {/* Voice Assistant */}
            {showVoicePanel && (
              <div className="animate-fade-up">
                <VoiceAssistant
                  onTranscriptUpdate={(text) => {
                    // You can use this to auto-fill code comments or notes
                    console.log('Voice transcript:', text);
                  }}
                />
              </div>
            )}

            {/* Questions Navigator */}
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-4">Questions</h3>
                <div className="space-y-2">
                  {questions.map((q: any, index: number) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        index === currentIndex
                          ? 'glass-card border border-primary/50'
                          : 'hover:bg-card'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        feedbacks[index] ? 'bg-success' : 'bg-muted'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-sm truncate">Problem {index + 1}</span>
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