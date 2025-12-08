import { useEffect, useRef, useState } from 'react';

export function useSpeechRecognition(lang = 'en-GB') {
  const SpeechRecognition = typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

  const [supported] = useState(() => !!SpeechRecognition);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!supported) return undefined;

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ')
        .trim();
      setTranscript(text);
    };

    recognition.onerror = (event) => {
      setError(event.error || 'Speech recognition error');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [SpeechRecognition, lang, supported]);

  const startRecognition = () => {
    if (!supported || !recognitionRef.current) return;
    setError('');
    setTranscript('');
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      setError(err?.message || 'Unable to start speech recognition');
    }
  };

  const stopRecognition = () => {
    if (!supported || !recognitionRef.current) return;
    recognitionRef.current.stop();
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    supported,
    isListening,
    transcript,
    error,
    startRecognition,
    stopRecognition,
    resetTranscript,
  };
}
