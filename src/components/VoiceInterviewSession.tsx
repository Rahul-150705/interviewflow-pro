import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Question {
  id: string | number;
  questionText: string;
}

interface Interview {
  id: string;
  questions: Question[];
  jobTitle: string;
}

interface VoiceInterviewSessionProps {
  interview: Interview;
  onComplete: (results: any) => void;
  onExit: () => void;
}

const VoiceInterviewSession = ({ interview, onComplete, onExit }: VoiceInterviewSessionProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentQuestion = interview.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === interview.questions.length - 1;

  // Initialize Speech Recognition and Speech Synthesis
  useEffect(() => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: 'Browser Not Supported',
        description: 'Your browser does not support speech recognition. Please use Chrome or Edge.',
        variant: 'destructive'
      });
      return;
    }

    if (!('speechSynthesis' in window)) {
      toast({
        title: 'Browser Not Supported',
        description: 'Your browser does not support text-to-speech.',
        variant: 'destructive'
      });
      return;
    }

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(prev => prev + finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      if (event.error !== 'no-speech') {
        toast({
          title: 'Recognition Error',
          description: `Error: ${event.error}`,
          variant: 'destructive'
        });
      }
    };

    recognition.onend = () => {
      if (isRecording) {
        recognition.start(); // Restart if still recording
      }
    };

    recognitionRef.current = recognition;
    synthRef.current = window.speechSynthesis;

    // Speak the first question
    speakText(currentQuestion.questionText);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Speak text using browser's TTS (FREE!)
  const speakText = (text: string) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const toggleSpeech = () => {
    if (!synthRef.current) return;

    if (isSpeaking) {
      synthRef.current.pause();
      setIsSpeaking(false);
    } else if (synthRef.current.paused) {
      synthRef.current.resume();
      setIsSpeaking(true);
    } else {
      speakText(currentQuestion.questionText);
    }
  };

  const stopSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const startRecording = () => {
    if (!recognitionRef.current) return;

    stopSpeech(); // Stop any ongoing speech
    setTranscript('');
    setIsRecording(true);

    try {
      recognitionRef.current.start();
      toast({
        title: 'Recording Started',
        description: 'Speak your answer now...'
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recognitionRef.current) return;

    setIsRecording(false);
    recognitionRef.current.stop();

    if (!transcript.trim()) {
      toast({
        title: 'No Speech Detected',
        description: 'Please try again and speak your answer.',
        variant: 'destructive'
      });
      return;
    }

    // Send to backend for processing
    await submitAnswer(transcript.trim());
  };

  const submitAnswer = async (userAnswer: string) => {
    setIsProcessing(true);

    try {
      console.log('Submitting voice answer to backend...');
      
      // Send transcribed text to backend
      const response = await api.request('/voice-interview/process', {
        method: 'POST',
        body: JSON.stringify({
          questionId: currentQuestion.id,
          questionText: currentQuestion.questionText,
          userAnswer: userAnswer
        })
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to process answer');
      }

      console.log('✅ Answer processed successfully');
      console.log('AI Feedback:', response.feedbackText);

      // Save answer and feedback
      const newAnswers = [...answers, userAnswer];
      const newFeedbacks = [...feedbacks, {
        score: response.score,
        aiFeedback: response.feedbackText
      }];

      setAnswers(newAnswers);
      setFeedbacks(newFeedbacks);

      // Speak the AI feedback using browser TTS (FREE!)
      speakText(response.feedbackText);

      toast({
        title: 'Answer Submitted',
        description: `Score: ${Math.round(response.score)}/100`
      });

      // Move to next question or complete
      setTimeout(() => {
        if (isLastQuestion) {
          completeInterview(newAnswers, newFeedbacks);
        } else {
          moveToNextQuestion();
        }
      }, 3000); // Wait for feedback speech to start

    } catch (error: any) {
      console.error('Error submitting answer:', error);
      toast({
        title: 'Submission Error',
        description: error.message || 'Failed to submit answer',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const moveToNextQuestion = () => {
    stopSpeech();
    setTranscript('');
    setCurrentQuestionIndex(prev => prev + 1);
    
    // Speak next question
    setTimeout(() => {
      speakText(interview.questions[currentQuestionIndex + 1].questionText);
    }, 500);
  };

  const completeInterview = (finalAnswers: string[], finalFeedbacks: any[]) => {
    stopSpeech();
    
    onComplete({
      questions: interview.questions,
      answers: finalAnswers,
      feedbacks: finalFeedbacks
    });
  };

  const handleExit = () => {
    stopSpeech();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onExit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold gradient-text">Voice Interview</h1>
            <Button variant="outline" onClick={handleExit}>
              Exit Interview
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {interview.questions.length}</span>
            <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-primary transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / interview.questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-6 glass-card">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4 text-primary">
                Question {currentQuestionIndex + 1}
              </h2>
              <p className="text-lg leading-relaxed">{currentQuestion.questionText}</p>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSpeech}
              className="ml-4"
              disabled={isProcessing}
            >
              {isSpeaking ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
          </div>
        </Card>

        {/* Recording Section */}
        <Card className="p-8 glass-card">
          <div className="text-center">
            <div className="mb-6">
              <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing || isSpeaking}
                className={`h-24 w-24 rounded-full ${
                  isRecording 
                    ? 'bg-destructive hover:bg-destructive/90 animate-pulse' 
                    : 'gradient-primary'
                }`}
              >
                {isRecording ? (
                  <MicOff className="h-12 w-12" />
                ) : (
                  <Mic className="h-12 w-12" />
                )}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {isProcessing 
                ? 'Processing your answer...' 
                : isRecording 
                ? 'Recording... Click to stop' 
                : isSpeaking
                ? 'Listening to question/feedback...'
                : 'Click to start speaking'}
            </p>

            {/* Transcript Display */}
            {transcript && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Your Answer:</p>
                <p className="text-left">{transcript}</p>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="mt-6">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}
          </div>
        </Card>

        {/* Tips */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>💡 Tip: Speak clearly and take your time. The AI will provide feedback after you stop recording.</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterviewSession;