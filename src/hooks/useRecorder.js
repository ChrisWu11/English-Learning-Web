import { useEffect, useRef, useState } from 'react';

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [error, setError] = useState('');
  const [isSupported] = useState(() => typeof window !== 'undefined' && !!window.MediaRecorder);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const teardownStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => () => {
    teardownStream();
  }, []);

  const startRecording = async () => {
    if (!isSupported || isRecording) return;
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (audioURL) URL.revokeObjectURL(audioURL);
        setAudioURL(URL.createObjectURL(blob));
        chunksRef.current = [];
        teardownStream();
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setError(err?.message || 'Unable to start recording');
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const resetRecording = () => {
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL('');
    chunksRef.current = [];
  };

  return {
    isSupported,
    isRecording,
    audioURL,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
