import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Share2, 
  Trash2, 
  Send, 
  PlusCircle, 
  Loader2,
  Image,
  Bot, 
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import doctorService from '@/services/doctor.service';

const AIChat: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const { 
    currentAIChat, 
    loadAIChat, 
    sendMessageToAI, 
    createNewAIChat,
    deleteAIChat,
    shareAIChatWithDoctor
  } = useChat();
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Load available doctors for sharing
    const loadDoctors = async () => {
      try {
        const doctors = await doctorService.getAllDoctors();
        setAvailableDoctors(doctors || []);
      } catch (error) {
        console.error('Error loading doctors:', error);
      }
    };
    
    loadDoctors();
  }, []);

  useEffect(() => {
    // If chatId is provided, load that specific chat
    if (chatId) {
      loadAIChat(chatId);
    } else {
      // Start a new chat
      createNewAIChat();
    }
    
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognitionAPI();
      speechRecognitionRef.current.continuous = false;
      speechRecognitionRef.current.interimResults = false;
      
      speechRecognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + ' ' + transcript);
      };
      
      speechRecognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
    
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = new SpeechSynthesisUtterance();
    }
    
    // Cleanup
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [chatId, loadAIChat, createNewAIChat]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentAIChat?.messages]);

  const toggleRecording = () => {
    if (!speechRecognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    
    if (isRecording) {
      speechRecognitionRef.current.stop();
    } else {
      try {
        speechRecognitionRef.current.lang = selectedLanguage;
        speechRecognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const speakText = (text: string) => {
    if (!speechSynthesisRef.current) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }
    
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    try {
      speechSynthesisRef.current.text = text;
      speechSynthesisRef.current.lang = selectedLanguage;
      
      // Find a voice for the selected language
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(selectedLanguage.split('-')[0]));
      if (voice) {
        speechSynthesisRef.current.voice = voice;
      }
      
      speechSynthesisRef.current.onend = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(speechSynthesisRef.current);
      setIsSpeaking(true);
    } catch (error) {
      console.error('Error using speech synthesis:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotoPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async () => {
    if (!selectedPhoto) return;
    
    // In a real implementation, you would upload the photo to a server
    // and get back a URL or analysis results
    
    // For this demo, we'll simulate an analysis response
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add a message with the photo
      const photoMessage = `[Image uploaded: ${selectedPhoto.name}]`;
      await sendMessageToAI(photoMessage);
      
      // Simulate AI analyzing the photo
      setTimeout(async () => {
        await sendMessageToAI("I see you've uploaded an image. While I can't analyze the specific content of this image in detail, if you describe your symptoms or concerns, I can provide you with relevant health information.");
        setIsLoading(false);
      }, 2000);
      
      // Clear the photo
      setSelectedPhoto(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error('Error handling photo:', error);
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if there's a photo to upload
    if (selectedPhoto) {
      await uploadPhoto();
      return;
    }
    
    // Otherwise send the text message
    if (!message.trim()) return;
    
    setIsLoading(true);
    try {
      // Make sure we're passing the current chat ID to retain context
      await sendMessageToAI(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    createNewAIChat();
    navigate('/ai');
  };

  const handleShareChat = async () => {
    if (!selectedDoctor) return;
    
    try {
      await shareAIChatWithDoctor(selectedDoctor);
      setIsSharingModalOpen(false);
    } catch (error) {
      console.error('Error sharing chat:', error);
    }
  };

  const handleDeleteChat = async () => {
    try {
      await deleteAIChat();
      navigate('/ai');
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const languages = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'hi-IN', label: 'Hindi' },
    { value: 'ta-IN', label: 'Tamil' },
    { value: 'te-IN', label: 'Telugu' },
    { value: 'mr-IN', label: 'Marathi' },
    { value: 'bn-IN', label: 'Bengali' },
    { value: 'gu-IN', label: 'Gujarati' },
    { value: 'kn-IN', label: 'Kannada' },
    { value: 'ml-IN', label: 'Malayalam' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">KABIRAJ AI Health Assistant</h1>
        <div className="flex gap-2 items-center">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[180px]">
              <Languages className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Chat
          </Button>
          
          {currentAIChat && (
            <>
              <Dialog open={isSharingModalOpen} onOpenChange={setIsSharingModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share with Doctor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Chat with Doctor</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Select a doctor to share this chat with. The doctor will receive a summary of your conversation.
                    </p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {availableDoctors.map(doctor => (
                        <div 
                          key={doctor.id || doctor._id}
                          className={`p-3 rounded-md cursor-pointer border ${
                            selectedDoctor === (doctor.id || doctor._id)
                              ? 'border-primary bg-primary/10' 
                              : 'border-border'
                          }`}
                          onClick={() => setSelectedDoctor(doctor.id || doctor._id)}
                        >
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage 
                                src={doctor.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}`} 
                                alt={doctor.name} 
                              />
                              <AvatarFallback>{doctor.name?.charAt(0) || 'D'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{doctor.name}</p>
                              <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleShareChat} className="w-full" disabled={!selectedDoctor}>
                      Share Chat
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" onClick={handleDeleteChat}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Chat
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>
            {currentAIChat?.title || 'New Conversation'}
            {currentAIChat?.createdAt && 
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {formatDate(currentAIChat.createdAt)}
              </span>
            }
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4">
          {!currentAIChat || currentAIChat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="mb-6">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarFallback>
                    <Bot size={40} />
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold mb-2">Welcome to KABIRAJ AI Health Assistant</h3>
                <p className="text-muted-foreground mb-4">
                  I can help you with health concerns, medical information, and general wellness advice.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-md">
                <Button variant="outline" onClick={() => sendMessageToAI("What are common symptoms of diabetes?")}>
                  Diabetes symptoms
                </Button>
                <Button variant="outline" onClick={() => sendMessageToAI("How can I manage my stress levels?")}>
                  Stress management
                </Button>
                <Button variant="outline" onClick={() => sendMessageToAI("What should I eat for a healthy diet?")}>
                  Healthy diet
                </Button>
                <Button variant="outline" onClick={() => sendMessageToAI("How much exercise do I need each week?")}>
                  Exercise needs
                </Button>
                <Button variant="outline" onClick={() => sendMessageToAI("What are the warning signs of a heart attack?")}>
                  Heart attack signs
                </Button>
                <Button variant="outline" onClick={() => sendMessageToAI("How can I improve my sleep quality?")}>
                  Sleep quality
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentAIChat.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center mb-2">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback>
                            <Bot size={14} />
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">KABIRAJ AI</span>
                        
                        {/* Text-to-speech button for AI messages */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-auto h-6 w-6 p-0" 
                          onClick={() => speakText(msg.content)}
                        >
                          {isSpeaking ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                    {msg.content.startsWith('[Image uploaded:') ? (
                      <div>
                        <p className="text-sm mb-2">{msg.content}</p>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded p-2 text-center text-xs">
                          Image uploaded
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    <p className="text-xs opacity-70 mt-1 text-right">
                      {formatDate(msg.timestamp)} {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 border-t">
          {photoPreview && (
            <div className="w-full mb-3">
              <div className="relative w-24 h-24 rounded overflow-hidden">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-0 right-0 h-6 w-6 p-0 rounded-full"
                  onClick={() => {
                    setSelectedPhoto(null);
                    setPhotoPreview(null);
                  }}
                >
                  &times;
                </Button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload an image</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    onClick={toggleRecording}
                    disabled={isLoading}
                  >
                    {isRecording ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isRecording ? "Stop recording" : "Start voice input"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            
            <Button type="submit" disabled={isLoading || (!message.trim() && !selectedPhoto)}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIChat; 