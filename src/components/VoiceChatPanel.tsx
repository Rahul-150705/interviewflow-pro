import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Volume2, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface VoiceChatPanelProps {
  interviewId?: string;
  className?: string;
}

const VoiceChatPanel = ({ interviewId, className = '' }: VoiceChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSpeakingRef = useRef(false);

  // Initialize Speech Recognition and Synthesis
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not available');
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript = event.results[i][0].transcript;
        }
        setCurrentTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        console.log('Recognition ended');
        setIsRecording(false);
        if (currentTranscript.trim()) {
          sendMessage(currentTranscript.trim());
          setCurrentTranscript('');
        }
      };

      recognitionRef.current = recognition;
    }

    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [currentTranscript]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ Speak text with better error handling
  const speakText = (text: string) => {
    if (!synthRef.current) {
      console.error('Speech synthesis not available');
      return;
    }

    if (isSpeakingRef.current) {
      synthRef.current.cancel();
    }

    setTimeout(() => {
      if (!synthRef.current) return;

      try {
        const maxLength = 200;
        const chunks = text.match(new RegExp(`.{1,${maxLength}}`, 'g')) || [text];
        
        let currentChunk = 0;
        
        const speakChunk = () => {
          if (currentChunk >= chunks.length || !synthRef.current) {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            return;
          }

          const utterance = new SpeechSynthesisUtterance(chunks[currentChunk]);
          utterance.lang = 'en-US';
          utterance.rate = 0.95;
          utterance.pitch = 1;
          utterance.volume = 1;

          utterance.onstart = () => {
            console.log(`🔊 Speaking chunk ${currentChunk + 1}/${chunks.length}`);
            setIsSpeaking(true);
            isSpeakingRef.current = true;
          };

          utterance.onend = () => {
            currentChunk++;
            if (currentChunk < chunks.length) {
              setTimeout(speakChunk, 100);
            } else {
              setIsSpeaking(false);
              isSpeakingRef.current = false;
            }
          };

          utterance.onerror = (event) => {
            console.error('Speech error:', event.error);
            currentChunk++;
            if (currentChunk < chunks.length) {
              setTimeout(speakChunk, 100);
            } else {
              setIsSpeaking(false);
              isSpeakingRef.current = false;
            }
          };

          if (synthRef.current) {
            synthRef.current.speak(utterance);
          }
        };

        speakChunk();
      } catch (error) {
        console.error('Error in speakText:', error);
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      }
    }, 100);
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Voice Not Available',
        description: 'Please type your message instead.',
        variant: 'destructive'
      });
      return;
    }

    if (synthRef.current && isSpeakingRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }

    setCurrentTranscript('');
    setIsRecording(true);

    try {
      recognitionRef.current.start();
      console.log('🎤 Started recording');
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      console.log('🛑 Stopped recording');
    } catch (e) {
      console.log('Recognition already stopped');
    }
  };

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    console.log('📤 Sending message:', userMessage);

    // Add user message to chat
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setCurrentTranscript('');
    setTextInput('');
    setIsProcessing(true);

    try {
      console.log('🚀 Calling backend API...');
      
      const response = await api.request('/voice-interview/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userMessage,
          interviewId: interviewId
        })
      });

      console.log('📥 Backend response:', response);

      let aiResponseText = '';

      // Check if response is successful
      if (response && response.reply) {
        aiResponseText = response.reply;
        console.log('✅ Got AI reply:', aiResponseText);
      } else {
        // Fallback message
        aiResponseText = "Sorry, the AI service is currently not available. Please check your OpenAI API key configuration or try again later.";
        console.log('⚠️ No valid response, using fallback');
      }

      // Add AI response to chat
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: aiResponseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);

      console.log('🎙️ Speaking AI response...');
      setTimeout(() => {
        speakText(aiResponseText);
      }, 300);

    } catch (error: any) {
      console.error('❌ Error:', error);
      
      const errorText = "Sorry, the AI service is currently not available. Please check your OpenAI API key configuration or try again later.";
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: errorText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      
      setTimeout(() => {
        speakText(errorText);
      }, 300);

    } finally {
      setIsProcessing(false);
      console.log('✅ Processing complete');
    }
  };

  const handleTextSend = () => {
    if (textInput.trim()) {
      sendMessage(textInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSend();
    }
  };

  return (
    <Card className={`flex flex-col glass-card ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Voice Assistant</h3>
          </div>
          {isSpeaking && (
            <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
              <div className="flex gap-1">
                <div className="w-1 h-4 bg-primary rounded animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-4 bg-primary rounded animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-4 bg-primary rounded animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
              Speaking...
            </div>
          )}
          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          )}
        </div>
      </div>

      {/* Messages - Instagram Style */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[300px] max-h-[500px]">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <div>
              <Mic className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm font-medium">Start a conversation</p>
              <p className="text-xs mt-1">Type or speak to chat with AI</p>
              <p className="text-xs mt-2 text-primary">
                💡 AI responds automatically with voice
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  msg.type === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                <span className="text-[10px] opacity-60 mt-1 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Voice Recording Status */}
      {currentTranscript && isRecording && (
        <div className="px-4 pb-2">
          <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-primary">Recording...</span>
            </div>
            <p className="text-sm">{currentTranscript}</p>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Text Input */}
        <div className="flex gap-2">
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isProcessing || isSpeaking || isRecording}
            className="flex-1"
          />
          <Button
            onClick={handleTextSend}
            disabled={!textInput.trim() || isProcessing || isSpeaking || isRecording}
            size="icon"
            className="gradient-primary"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Voice Button */}
        <Button
          size="lg"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || isSpeaking}
          className={`w-full ${
            isRecording 
              ? 'bg-destructive hover:bg-destructive/90' 
              : 'gradient-primary'
          }`}
        >
          {isRecording ? (
            <>
              <div className="relative mr-2">
                <MicOff className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
              </div>
              Stop Recording
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : isSpeaking ? (
            <>
              <Volume2 className="h-5 w-5 mr-2 animate-pulse" />
              AI Speaking...
            </>
          ) : (
            <>
              <Mic className="h-5 w-5 mr-2" />
              Hold to Speak
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          {isRecording 
            ? '🔴 Recording... Release to send' 
            : isProcessing
            ? '⏳ Getting AI response...'
            : isSpeaking
            ? '🔊 AI is speaking...'
            : 'Type or speak to chat with AI assistant'}
        </p>
      </div>
    </Card>
  );
};

export default VoiceChatPanel;