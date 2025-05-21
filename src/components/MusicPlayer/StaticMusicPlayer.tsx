"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FiPlay,
  FiPause,
  FiSkipForward,
  FiSkipBack,
  FiList,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

interface Song {
  title: string;
  url: string;
}

const songs: Song[] = [
  { title: "不凡", url: "https://cdn.wuyilin18.top/music/不凡.mp3" },
  { title: "Let It Go", url: "https://cdn.wuyilin18.top/music/Let It Go.mp3" },
  {
    title: "Show Yourself",
    url: "https://cdn.wuyilin18.top/music/Show Yourself.mp3",
  },
];

const StaticMusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [miniMode, setMiniMode] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // 位置固定在右下角
  const position = {
    right: "30px",
    bottom: "30px",
  };

  // 初始化音频分析器
  useEffect(() => {
    if (!audioRef.current) return;

    const initAudio = () => {
      try {
        // @ts-expect-error - 兼容不同浏览器
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        if (audioRef.current) {
          sourceRef.current = audioContextRef.current.createMediaElementSource(
            audioRef.current
          );
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        }
      } catch (err) {
        console.error("音频初始化失败:", err);
      }
    };

    // 仅在用户交互后初始化音频上下文（浏览器策略）
    const handleFirstInteraction = () => {
      if (!audioContextRef.current && audioRef.current) {
        initAudio();
        window.removeEventListener("click", handleFirstInteraction);
      }
    };

    window.addEventListener("click", handleFirstInteraction);

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch((err) => console.error(err));
      }
    };
  }, []);

  // 绘制音频频谱
  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current || !isPlaying) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const radius = miniMode ? 30 : 60;
      const center = radius;

      const draw = () => {
        if (!ctx || !analyser) return;

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制圆形频谱
        const barCount = miniMode ? 32 : 64;
        const barWidth = (2 * Math.PI) / barCount;

        for (let i = 0; i < barCount; i++) {
          const barIndex = Math.floor((i * bufferLength) / barCount);
          const barHeight = (dataArray[barIndex] / 255) * 20;

          const angle = i * barWidth;

          const x1 = center + (radius - 5) * Math.cos(angle);
          const y1 = center + (radius - 5) * Math.sin(angle);
          const x2 = center + (radius + barHeight) * Math.cos(angle);
          const y2 = center + (radius + barHeight) * Math.sin(angle);

          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          gradient.addColorStop(0, "#6366f1");
          gradient.addColorStop(1, "#8b5cf6");

          ctx.beginPath();
          ctx.strokeStyle = gradient;
          ctx.lineWidth = miniMode ? 1 : 2;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        animationRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch (err) {
      console.error("频谱绘制失败:", err);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, miniMode]);

  // 更新进度条
  useEffect(() => {
    if (!audioRef.current) return;

    const updateProgress = () => {
      if (!audioRef.current) return;

      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 0;
      setProgress(currentTime);
      setDuration(duration);
    };

    const intervalId = setInterval(updateProgress, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // 切换迷你模式
  const toggleMiniMode = () => {
    setMiniMode(!miniMode);
  };

  // 播放/暂停
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.error("播放失败:", err));
    }

    setIsPlaying(!isPlaying);
  };

  // 下一首
  const nextSong = () => {
    setCurrentSong((prev) => (prev + 1) % songs.length);
    if (isPlaying && audioRef.current) {
      // 切换后自动播放
      audioRef.current.load();
      audioRef.current.play().catch((err) => console.error("播放失败:", err));
    }
  };

  // 上一首
  const prevSong = () => {
    setCurrentSong((prev) => (prev - 1 + songs.length) % songs.length);
    if (isPlaying && audioRef.current) {
      // 切换后自动播放
      audioRef.current.load();
      audioRef.current.play().catch((err) => console.error("播放失败:", err));
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      className={cn(
        "fixed z-50 rounded-full shadow-lg bg-white dark:bg-gray-800 flex flex-col items-center justify-center overflow-hidden transition-all duration-300",
        miniMode ? "w-[60px] h-[60px]" : "w-[120px] h-[120px]"
      )}
      style={{
        position: "fixed",
        ...position,
      }}
    >
      {/* 音频元素 */}
      <audio
        ref={audioRef}
        src={songs[currentSong].url}
        onEnded={nextSong}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* 频谱可视化 */}
      <canvas
        ref={canvasRef}
        width={miniMode ? 60 : 120}
        height={miniMode ? 60 : 120}
        className="absolute inset-0 pointer-events-none"
      />

      {/* 迷你模式切换按钮 - 显示在右上角 */}
      <button
        onClick={toggleMiniMode}
        className="absolute top-0 right-0 w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full z-20 m-1"
        title={miniMode ? "展开" : "收起"}
      />

      {/* 迷你模式只显示播放/暂停按钮 */}
      {miniMode ? (
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-200 z-10"
        >
          {isPlaying ? <FiPause /> : <FiPlay />}
        </button>
      ) : (
        <>
          {/* 歌曲标题 */}
          <div className="absolute top-2 text-xs text-center font-medium text-gray-700 dark:text-gray-300 z-10 max-w-[90%] truncate">
            {songs[currentSong].title}
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-center space-x-2 z-10">
            <button
              onClick={prevSong}
              className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-200"
            >
              <FiSkipBack />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-200"
            >
              {isPlaying ? <FiPause /> : <FiPlay />}
            </button>
            <button
              onClick={nextSong}
              className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-200"
            >
              <FiSkipForward />
            </button>
          </div>

          {/* 播放时间和进度 */}
          <div className="absolute bottom-2 text-[8px] text-gray-700 dark:text-gray-300 z-10">
            {formatTime(progress)} / {formatTime(duration)}
          </div>

          {/* 播放列表按钮 */}
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="absolute bottom-2 right-2 w-6 h-6 flex items-center justify-center text-gray-700 dark:text-gray-200 z-10"
          >
            <FiList />
          </button>
        </>
      )}

      {/* 播放列表弹出框 */}
      {showPlaylist && !miniMode && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20">
          {songs.map((song, index) => (
            <div
              key={index}
              className={cn(
                "px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                index === currentSong
                  ? "text-indigo-600 dark:text-indigo-400 font-medium"
                  : "text-gray-700 dark:text-gray-300"
              )}
              onClick={() => {
                setCurrentSong(index);
                setShowPlaylist(false);
                if (audioRef.current) {
                  audioRef.current.load();
                  audioRef.current
                    .play()
                    .catch((err) => console.error("播放失败:", err));
                }
              }}
            >
              {song.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaticMusicPlayer;
