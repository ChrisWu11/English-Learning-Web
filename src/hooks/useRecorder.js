import { useEffect, useRef, useState } from 'react';

const TARGET_SAMPLES = 64;

const captureSnapshot = (analyser, dataArray) => {
  if (!analyser || !dataArray) return [];
  analyser.getByteTimeDomainData(dataArray);
  const { length } = dataArray;
  const step = Math.max(1, Math.floor(length / TARGET_SAMPLES));
  const snapshot = [];
  for (let i = 0; i < length; i += step) {
    const value = (dataArray[i] - 128) / 128;
    snapshot.push(value);
  }
  return snapshot;
};

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [error, setError] = useState('');
  const [waveform, setWaveform] = useState([]);
  const [isSupported] = useState(() => typeof window !== 'undefined' && !!window.MediaRecorder);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const dataArrayRef = useRef(null);

  const teardownStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  useEffect(() => () => {
    teardownStream();
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }, []);

  const pumpWaveform = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    const snapshot = captureSnapshot(analyserRef.current, dataArrayRef.current);
    setWaveform(snapshot);
    animationRef.current = requestAnimationFrame(pumpWaveform);
  };

  const startRecording = async () => {
    if (!isSupported || isRecording) return;
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      dataArrayRef.current = new Uint8Array(analyser.fftSize);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

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
        setWaveform(captureSnapshot(analyserRef.current, dataArrayRef.current));
        chunksRef.current = [];
        teardownStream();
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      pumpWaveform();
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
    setWaveform([]);
  };

  return {
    isSupported,
    isRecording,
    audioURL,
    waveform,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
