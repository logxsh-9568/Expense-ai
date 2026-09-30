import { useState, useCallback, useRef, useEffect } from 'react';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  errorMessage: string | null;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
    }
  }, []);

  const processAudioWithGroq = async (audioBlob: Blob) => {
    try {
      setErrorMessage(null);
      setTranscript('Converting speech to text...');

      // Convert the raw webm audio to a File object for the API
      const file = new File([audioBlob], 'speech.webm', { type: 'audio/webm' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'en');
      formData.append('temperature', '0'); // 0 for max accuracy, no hallucinations

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid Groq API Key. Please add your free key in useSpeechRecognition.ts!");
        }
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      setTranscript(data.text);

    } catch (error: any) {
      console.error('Groq STT Error:', error);
      setErrorMessage(error.message || 'Failed to process speech.');
      setTranscript('');
    }
  };

  const startListening = useCallback(async () => {
    setErrorMessage(null);
    setTranscript('');
    audioChunksRef.current = [];

    if (GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
      setErrorMessage("Please paste your free Groq API key in useSpeechRecognition.ts to use Whisper AI.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudioWithGroq(audioBlob);

        // Stop all microphone tracks to release the hardware
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);

      // --- Silence Detection Logic ---
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.minDecibels = -50;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let lastSpeechTime = Date.now();
      let hasSpoken = false;
      let checkInterval: number;

      const checkAudio = () => {
        if (mediaRecorder.state !== 'recording') return;

        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // If average volume is above a threshold, consider it speech
        if (average > 10) {
          lastSpeechTime = Date.now();
          hasSpoken = true;
        } else {
          // If they have spoken and been silent for 1.5 seconds, stop recording
          if (hasSpoken && (Date.now() - lastSpeechTime > 1500)) {
            mediaRecorder.stop();
            return; // Exit loop
          }
        }

        checkInterval = requestAnimationFrame(checkAudio);
      };

      checkAudio();

      // Ensure we clean up the interval when stopped manually
      mediaRecorder.addEventListener('stop', () => {
        cancelAnimationFrame(checkInterval);
        audioContext.close();
      });

    } catch (error) {
      console.error('Mic Error:', error);
      setErrorMessage('Microphone access denied. Please allow mic permissions.');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    clearTranscript
  };
}
