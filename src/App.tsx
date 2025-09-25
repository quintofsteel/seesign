import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Pause, Settings, History, Volume2, User, Loader, Brain, Hand, RotateCcw, Copy, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConversationItem {
  id: string;
  text: string;
  timestamp: Date;
  videoUrl?: string;
}

type AppState = 'idle' | 'listening' | 'processing' | 'result';

function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [currentText, setCurrentText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('ASL');
  const [processingProgress, setProcessingProgress] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sample sign language video (replace with your actual video)
  const sampleSignLanguageVideo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setCurrentText(finalTranscript);
          processToSignLanguage(finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        if (appState === 'listening') {
          setAppState('processing');
        }
      };
    }
  }, [appState]);

  const processToSignLanguage = async (text: string) => {
    setAppState('processing');
    setProcessingProgress(0);
    
    // Simulate AI processing with progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    clearInterval(progressInterval);
    setProcessingProgress(100);
    
    const newConversation: ConversationItem = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      videoUrl: sampleSignLanguageVideo
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setAppState('result');
    setIsPlaying(true);
    
    // Auto-play video
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 500);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setAppState('listening');
      setCurrentText('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      if (currentText.trim()) {
        processToSignLanguage(currentText);
      } else {
        setAppState('idle');
      }
    }
  };

  const resetApp = () => {
    setAppState('idle');
    setCurrentText('');
    setProcessingProgress(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const copyText = () => {
    if (currentText) {
      navigator.clipboard.writeText(currentText);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-black/50 backdrop-blur-md border-b border-gray-800 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="p-2 bg-white rounded-lg">
                <Hand className="h-6 w-6 text-black" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">✌</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold">SeeSign</h1>
            <span className="text-xs bg-gradient-to-r from-red-500 to-red-600 px-2 py-1 rounded-full">AI Powered</span>
          </motion.div>
          <div className="flex items-center space-x-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <History className="h-5 w-5" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto px-6 py-8 relative">
        <AnimatePresence mode="wait">
          {/* Idle State */}
          {appState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="text-center space-y-8"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Speak to Sign
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Transform your speech into beautiful sign language with AI-powered real-time translation
                </p>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="flex justify-center"
              >
                <button
                  onClick={startListening}
                  className="group relative w-32 h-32 rounded-full bg-gradient-to-br from-gray-800 to-black border-4 border-gray-600 hover:border-red-500 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Mic className="h-12 w-12 mx-auto text-white group-hover:text-red-400 transition-colors duration-300" />
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-400 group-hover:text-white transition-colors">
                    Tap to speak
                  </div>
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
              >
                {[
                  { icon: Volume2, title: "Speech Recognition", desc: "Advanced AI listens to your voice" },
                  { icon: Brain, title: "AI Processing", desc: "Neural networks convert speech to signs" },
                  { icon: Hand, title: "Sign Language", desc: "Beautiful video output in your language" }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6 text-center hover:border-red-500/50 transition-colors duration-300"
                  >
                    <feature.icon className="h-8 w-8 mx-auto mb-3 text-red-400" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Listening State */}
          {appState === 'listening' && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-8"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative mx-auto w-48 h-48 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/30 border-4 border-red-500 flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-32 h-32 rounded-full bg-red-500/30 flex items-center justify-center"
                >
                  <Mic className="h-16 w-16 text-red-400" />
                </motion.div>
                
                {/* Pulse rings */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-red-500/30"
                    animate={{ scale: [1, 2, 2], opacity: [1, 0, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                  />
                ))}
              </motion.div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-red-400">Listening...</h2>
                <p className="text-gray-400">Speak clearly into your microphone</p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopListening}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-300"
                >
                  Stop Listening
                </motion.button>
              </div>

              {/* Live transcript */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 max-w-2xl mx-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">Live Transcript</span>
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-red-400 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-white text-lg leading-relaxed min-h-[60px]">
                  {currentText || 'Start speaking...'}
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Processing State */}
          {appState === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="text-center space-y-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="relative mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-red-500/20 to-blue-500/20 border-4 border-gray-600 flex items-center justify-center"
              >
                <Brain className="h-12 w-12 text-red-400" />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-white bg-clip-text text-transparent">
                  Analysing Speech
                </h2>
                <p className="text-gray-400">AI is processing your speech and generating sign language...</p>
                
                {/* Progress bar */}
                <div className="max-w-md mx-auto">
                  <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 to-red-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${processingProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{Math.round(processingProgress)}% complete</p>
                </div>
              </div>

              {/* Input text display */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-black/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 max-w-2xl mx-auto"
              >
                <h3 className="text-sm text-gray-400 mb-3">Processing Text:</h3>
                <p className="text-white text-lg">{currentText}</p>
              </motion.div>
            </motion.div>
          )}

          {/* Result State */}
          {appState === 'result' && conversations.length > 0 && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="space-y-6"
            >
              {/* Action buttons */}
              <div className="flex justify-center space-x-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetApp}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>New Translation</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyText}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Text</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </motion.button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6"
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Volume2 className="h-5 w-5 mr-2 text-red-400" />
                    Speech Input
                  </h3>
                  <div className="bg-black/50 rounded-xl p-4 border border-gray-600">
                    <p className="text-white text-lg leading-relaxed">{currentText}</p>
                    <p className="text-sm text-gray-400 mt-3">
                      {conversations[0]?.timestamp.toLocaleString()}
                    </p>
                  </div>
                </motion.div>

                {/* Output Section */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6"
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Hand className="h-5 w-5 mr-2 text-red-400" />
                    Sign Language Output
                  </h3>
                  
                  {/* Video Player */}
                  <div className="relative bg-black rounded-xl overflow-hidden aspect-video border border-gray-600">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      poster="https://images.pexels.com/photos/7289714/pexels-photo-7289714.jpeg?auto=compress&cs=tinysrgb&w=800"
                      onEnded={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    >
                      <source src={conversations[0]?.videoUrl} type="video/mp4" />
                    </video>
                    
                    {/* Video Controls */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlayback}
                        className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="h-8 w-8 text-white" />
                        ) : (
                          <Play className="h-8 w-8 text-white ml-1" />
                        )}
                      </motion.button>
                    </div>

                    {/* Language indicator */}
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1 border border-gray-600">
                      <span className="text-sm text-white">{selectedLanguage}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-red-400" />
                Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sign Language</label>
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-black border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="ASL">American Sign Language (ASL)</option>
                    <option value="BSL">British Sign Language (BSL)</option>
                    <option value="FSL">French Sign Language (FSL)</option>
                    <option value="JSL">Japanese Sign Language (JSL)</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <History className="h-5 w-5 mr-2 text-red-400" />
                Conversation History
              </h3>
              <div className="space-y-3 overflow-y-auto max-h-96">
                {conversations.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black/50 rounded-lg p-4 border border-gray-600 hover:border-red-500/50 transition-colors"
                  >
                    <p className="text-white mb-2">{item.text}</p>
                    <p className="text-xs text-gray-400">
                      {item.timestamp.toLocaleString()}
                    </p>
                  </motion.div>
                ))}
                {conversations.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No conversations yet</p>
                )}
              </div>
              <div className="flex justify-end pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowHistory(false)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;