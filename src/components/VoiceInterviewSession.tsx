import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Mic, Send, Volume2, VolumeX, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  roundType?: string;
}

interface FeedbackResult {
  score: number;
  aiFeedback: string;
}

interface VoiceInterviewSessionProps {
  interview: Interview;
  onComplete: (results: {
    questions: Question[];
    answers: string[];
    feedbacks: FeedbackResult[];
  }) => void;
  onExit: () => void;
}

const VoiceInterviewSession: React.FC<VoiceInterviewSessionProps> = ({
  interview,
  onComplete,
  onExit,
}) => {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackResult[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  
  // Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isChatListening, setIsChatListening] = useState(false);
  const [chatTranscript, setChatTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const chatRecognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentQuestion = interview.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / interview.questions.length) * 100;

  useEffect(() => {
    synthRef.current = window.speechSynthesis;

    // Initialize Speech Recognition for questions
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: 'Speech Recognition Error',
          description: 'Please try again or type your answer.',
          variant: 'destructive',
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      // Initialize Speech Recognition for chat
      chatRecognitionRef.current = new SpeechRecognition();
      chatRecognitionRef.current.continuous = true;
      chatRecognitionRef.current.interimResults = true;
      chatRecognitionRef.current.lang = 'en-US';
      chatRecognitionRef.current.maxAlternatives = 1;

      chatRecognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update with both final and interim results
        if (finalTranscript) {
          setChatTranscript(prev => {
            const base = prev.replace(/\s+$/, ''); // Remove trailing spaces
            return base + ' ' + finalTranscript;
          });
        } else if (interimTranscript) {
          setChatMessage(prev => prev + interimTranscript);
        }
      };

      chatRecognitionRef.current.onerror = (event: any) => {
        console.error('Chat speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsChatListening(false);
          toast({
            title: 'Speech Recognition Error',
            description: 'Please try again.',
            variant: 'destructive',
          });
        }
      };

      chatRecognitionRef.current.onend = () => {
        // Only stop if not manually listening
        if (isChatListening) {
          // Restart recognition if still supposed to be listening
          try {
            chatRecognitionRef.current.start();
          } catch (error) {
            setIsChatListening(false);
          }
        } else {
          setIsChatListening(false);
        }
      };
    }

    // Read first question automatically
    if (currentQuestion && autoSpeak) {
      speakText(`Question ${currentQuestionIndex + 1}: ${currentQuestion.questionText}`);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (chatRecognitionRef.current) {
        chatRecognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const speakText = (text: string, onEndCallback?: () => void) => {
    if (!synthRef.current || !autoSpeak) {
      onEndCallback?.();
      return;
    }

    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      onEndCallback?.();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Speech Recognition Not Supported',
        description: 'Please use a browser that supports speech recognition.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
      stopSpeaking();
    }
  };

  const toggleChatListening = () => {
    if (!chatRecognitionRef.current) {
      toast({
        title: 'Speech Recognition Not Supported',
        description: 'Please use a browser that supports speech recognition.',
        variant: 'destructive',
      });
      return;
    }

    if (isChatListening) {
      // Stop listening
      try {
        chatRecognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      setIsChatListening(false);
      
      // Set the message from transcript
      if (chatTranscript.trim()) {
        setChatMessage(chatTranscript.trim());
      }
    } else {
      // Start listening
      setChatTranscript('');
      setChatMessage('');
      stopSpeaking(); // Stop any ongoing speech
      
      try {
        chatRecognitionRef.current.start();
        setIsChatListening(true);
        
        toast({
          title: 'Listening...',
          description: 'Speak your message. Click the mic again when done.',
        });
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: 'Could not start listening',
          description: 'Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleChatSubmit = async (messageToSend?: string) => {
    const message = messageToSend || chatMessage.trim() || chatTranscript.trim();
    
    if (!message) {
      toast({
        title: 'Empty Message',
        description: 'Please type or speak a message first.',
        variant: 'destructive',
      });
      return;
    }

    // Stop listening if active
    if (isChatListening && chatRecognitionRef.current) {
      chatRecognitionRef.current.stop();
      setIsChatListening(false);
    }

    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setChatMessage('');
    setChatTranscript('');
    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:8080/api/voice-interview/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify({
          message: message,
          interviewId: interview.id
        })
      });

      const data = await response.json();
      
      if (data.success && data.reply) {
        // Add AI reply to chat
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
        
        // Automatically speak the AI reply
        speakText(data.reply);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = 'Sorry, I could not process your message. Please try again.';
      setChatHistory(prev => [...prev, { role: 'assistant', content: errorMessage }]);
      
      toast({
        title: 'Chat Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitAnswer = async () => {
    const answer = transcript.trim();
    
    if (!answer) {
      toast({
        title: 'No Answer',
        description: 'Please record or type your answer first.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    stopSpeaking();

    try {
      const response = await api.submitVoiceAnswer(
        currentQuestion.id,
        answer,
        currentQuestion.questionText
      );

      if (response.success && response.feedbackText) {
        const feedback: FeedbackResult = {
          score: response.score || 0,
          aiFeedback: response.feedbackText
        };

        setAnswers(prev => [...prev, answer]);
        setFeedbacks(prev => [...prev, feedback]);

        // Speak the feedback automatically
        speakText(response.feedbackText, () => {
          // After feedback is spoken, move to next question or complete
          if (currentQuestionIndex < interview.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setTranscript('');
            
            // Speak next question after a short delay
            setTimeout(() => {
              const nextQuestion = interview.questions[currentQuestionIndex + 1];
              speakText(`Question ${currentQuestionIndex + 2}: ${nextQuestion.questionText}`);
            }, 500);
          } else {
            onComplete({
              questions: interview.questions,
              answers: [...answers, answer],
              feedbacks: [...feedbacks, feedback],
            });
          }
        });

        toast({
          title: 'Answer Submitted',
          description: `Score: ${Math.round(response.score)}/100`,
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Submission Failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTranscript('');
      stopSpeaking();
      
      const nextQuestion = interview.questions[currentQuestionIndex + 1];
      if (autoSpeak) {
        speakText(`Question ${currentQuestionIndex + 2}: ${nextQuestion.questionText}`);
      }
    } else {
      onComplete({
        questions: interview.questions,
        answers,
        feedbacks,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Voice Interview</h1>
            <p className="text-muted-foreground mt-1">{interview.jobTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoSpeak(!autoSpeak)}
              className="flex items-center gap-2"
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {autoSpeak ? 'Auto-Speak On' : 'Auto-Speak Off'}
            </Button>
            <Button variant="outline" onClick={onExit}>Exit Interview</Button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {interview.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Voice Assistant Chat */}
          <Card className="p-6 space-y-4 glass-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Voice Assistant</h3>
                <p className="text-sm text-muted-foreground">Ask questions or get help</p>
              </div>
            </div>

            <div 
              ref={chatContainerRef}
              className="h-96 overflow-y-auto space-y-3 p-4 bg-muted/30 rounded-lg"
            >
              {chatHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Start a conversation with the AI assistant</p>
                    <p className="text-sm mt-1">Type or speak your message</p>
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card border border-border'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={isChatListening ? chatTranscript : chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleChatSubmit()}
                placeholder="Type your message or speak..."
                disabled={isProcessing || isChatListening}
                className="flex-1"
              />
              <Button
                size="icon"
                variant={isChatListening ? "destructive" : "outline"}
                onClick={toggleChatListening}
                disabled={isProcessing}
              >
                {isChatListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button
                size="icon"
                onClick={() => handleChatSubmit()}
                disabled={isProcessing || (!chatMessage.trim() && !chatTranscript.trim())}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>

            {isChatListening && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Listening... (Click mic to stop)
              </div>
            )}
          </Card>

          {/* Right Column: Interview Question */}
          <Card className="p-6 space-y-6 glass-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">Question {currentQuestionIndex + 1}</div>
                <h2 className="text-xl font-semibold mb-4">{currentQuestion.questionText}</h2>
              </div>
              {isSpeaking && (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={stopSpeaking}
                  className="shrink-0"
                >
                  <Volume2 className="w-5 h-5 text-primary animate-pulse" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Your answer will appear here... Click the mic to start speaking or type your answer."
                  className="w-full h-48 p-4 bg-muted/30 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isListening}
                />
                {isListening && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-destructive/10 border border-destructive/20 rounded-full">
                      <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                      <span className="text-sm text-destructive font-medium">Recording...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="lg"
                  variant={isListening ? "destructive" : "default"}
                  onClick={toggleListening}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isListening ? (
                    <>
                      <StopCircle className="w-5 h-5 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Start Speaking
                    </>
                  )}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!transcript.trim() || isProcessing}
                  className="flex-1"
                  size="lg"
                >
                  {isProcessing ? 'Processing...' : 'Submit Answer'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isProcessing}
                >
                  Skip
                </Button>
              </div>
            </div>

            {transcript && (
              <div className="text-sm text-muted-foreground">
                Word count: {transcript.trim().split(/\s+/).length} words
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterviewSession;