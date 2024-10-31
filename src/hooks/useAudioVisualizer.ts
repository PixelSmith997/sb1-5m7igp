import { useRef, useState, useEffect } from 'react';

export const useAudioVisualizer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const sourceRef = useRef<MediaElementAudioSourceNode>();
  const isInitialized = useRef(false);
  const successTimeoutRef = useRef<NodeJS.Timeout>();

  const cleanupAudioContext = async () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect();
    }
    
    if (audioContextRef.current?.state !== 'closed') {
      await audioContextRef.current?.close();
    }

    audioContextRef.current = undefined;
    analyserRef.current = undefined;
    sourceRef.current = undefined;
    isInitialized.current = false;
  };

  useEffect(() => {
    return () => {
      cleanupAudioContext();
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!audioFile) return;
    const url = URL.createObjectURL(audioFile);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audioFile]);

  const initializeAudioContext = async () => {
    if (!audioRef.current || isInitialized.current) return;

    await cleanupAudioContext();

    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;

      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      isInitialized.current = true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!isPlaying) return;
      
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = 3;
      const gap = 2;
      const totalBars = Math.floor(canvas.width / (barWidth + gap));
      const step = Math.ceil(bufferLength / totalBars);
      
      for (let i = 0; i < totalBars; i++) {
        const dataIndex = i * step;
        const value = dataArray[dataIndex] || 0;
        const barHeight = (value / 255) * canvas.height;
        const x = i * (barWidth + gap);
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(
          x,
          canvas.height / 2 - barHeight / 2,
          barWidth,
          barHeight
        );
      }
    };
    
    draw();
  };

  const handlePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (!isInitialized.current) {
        await initializeAudioContext();
      }

      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if (isPlaying) {
        await audioRef.current.pause();
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } else {
        await audioRef.current.play();
        drawWaveform();
      }
      
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error handling playback:', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      await cleanupAudioContext();
      setAudioFile(file);
      
      // Show success message
      setShowSuccess(true);
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleExportVideo = async () => {
    if (!canvasRef.current || !audioRef.current || !isInitialized.current) return;

    const canvas = canvasRef.current;
    const stream = canvas.captureStream(60);
    const audioTrack = audioRef.current.captureStream().getAudioTracks()[0];
    stream.addTrack(audioTrack);

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
    });

    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audio-visualization.webm';
      a.click();
      URL.revokeObjectURL(url);
    };

    audioRef.current.currentTime = 0;
    await audioRef.current.play();
    mediaRecorder.start();

    audioRef.current.onended = () => {
      mediaRecorder.stop();
      audioRef.current!.onended = null;
    };
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    isPlaying,
    duration,
    currentTime,
    audioFile,
    audioUrl,
    showSuccess,
    canvasRef,
    audioRef,
    handlePlay,
    handleFileChange,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleExportVideo,
    formatTime,
  };
};