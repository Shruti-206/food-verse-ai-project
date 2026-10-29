import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Upload,
  Volume2,
  Sparkles,
  Bot,
  User,
  Image as ImageIcon,
  X,
  RefreshCw,
  ChefHat,
} from 'lucide-react';
import { ChatMessage, UserPreferences } from '../types/food';
import { sendChefChatMessage, playChefVoiceAudio } from '../services/api';

interface ChefChatProps {
  userPreferences: UserPreferences;
  initialPrompt?: string;
  initialImage?: string;
}

export const ChefChat: React.FC<ChefChatProps> = ({
  userPreferences,
  initialPrompt,
  initialImage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        "Greetings! I am **Chef Verse**, your multimodal culinary mentor and food biochemist. Ask me anything about flavor balance, molecular cooking science, healthy ingredient substitutions, kitchen troubleshooting, or attach a photo of your pan in progress!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(initialImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'How do I fix an oversalted stew?',
    'What can I substitute for heavy cream in pasta?',
    'How to get crispy salmon skin without sticking?',
    'What wine or mocktail pairs with roasted salmon?',
  ]);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If initialPrompt was provided from another tab, send it automatically
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt, initialImage);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (textToSend?: string, imageToSend?: string) => {
    const content = textToSend || inputValue;
    const img = imageToSend !== undefined ? imageToSend : attachedImage;

    if (!content.trim() && !img) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim() || 'Please inspect this food photo and provide culinary advice.',
      image: img || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const response = await sendChefChatMessage({
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        image: img || undefined,
      });

      const assistantMessage: ChatMessage = {
        id: `chef-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (response.suggestedPrompts && response.suggestedPrompts.length > 0) {
        setSuggestedPrompts(response.suggestedPrompts);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but my culinary senses encountered an error. Please try again!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (msg: ChatMessage) => {
    setSpeakingMessageId(msg.id);
    try {
      // Strip markdown asterisks for clean speech synthesis
      const cleanText = msg.content.replace(/[*#_`]/g, '');
      await playChefVoiceAudio(cleanText, userPreferences.preferredVoice);
    } finally {
      setSpeakingMessageId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-orange-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <ChefHat className="w-3.5 h-3.5" />
            AI Master Chef & Culinary Biochemist
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Chef Verse Multimodal Assistant
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mt-1">
            Need real-time kitchen guidance, recipe tweaks, macro adjustments, or wine pairings?
            Type your question or attach a photo of your pan, dough, or seasoning to get instant chef feedback.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[650px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[78%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <ChefHat className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className="space-y-1.5">
                  <div
                    className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-950/80 text-slate-200 border border-slate-800/90 rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    {message.image && (
                      <div className="mb-3 rounded-2xl overflow-hidden max-h-56 border border-white/10">
                        <img
                          src={message.image}
                          alt="Attached plate"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {message.content}
                  </div>

                  {/* Message Meta & Audio TTS */}
                  <div
                    className={`flex items-center gap-2 text-[10px] text-slate-500 px-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{message.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleSpeak(message)}
                        disabled={speakingMessageId === message.id}
                        className="hover:text-orange-400 flex items-center gap-1 transition-colors"
                        title="Read aloud with Chef Voice"
                      >
                        <Volume2
                          className={`w-3 h-3 ${
                            speakingMessageId === message.id ? 'text-orange-400 animate-pulse' : ''
                          }`}
                        />
                        <span>Voice</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center text-xs text-slate-400">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0">
                <ChefHat className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
                <span>Chef Verse is consulting the culinary matrix...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Pills */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Quick:
          </span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-800 shrink-0 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800">
          {attachedImage && (
            <div className="relative inline-block mb-3 p-1 rounded-2xl bg-slate-950 border border-slate-800">
              <img
                src={attachedImage}
                alt="Image to send"
                className="w-16 h-16 rounded-xl object-cover"
              />
              <button
                onClick={() => setAttachedImage(null)}
                className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-md"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-orange-400 border border-slate-800 transition-colors"
              title="Attach cooking photo"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Chef Verse anything: substitutions, technique, pairings, flavor..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || (!inputValue.trim() && !attachedImage)}
              className="p-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-orange-500/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
