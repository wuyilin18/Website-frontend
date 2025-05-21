"use client";

import React, { useState, useEffect, useRef } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import Image from "next/image";

interface Song {
  title: string;
  artist: string;
  cover: string;
  url: string;
  duration: number;
}

const playlist: Song[] = [
  {
    title: "不凡",
    artist: "王铮亮",
    cover:
      "https://p1.music.126.net/lvfb_64QYmbib7ccHgDNJA==/109951165165604312.jpg",
    url: "http://music.163.com/song/media/outer/url?id=1465288702.mp3",
    duration: 211, // 3:31
  },
  {
    title: "不凡",
    artist: "蒋雪儿",
    cover: "https://cdn.wuyilin18.top/music/cover/bufan.jpg",
    url: "https://cdn.wuyilin18.top/music/不凡.mp3",
    duration: 240,
  },
  {
    title: "Let It Go",
    artist: "Idina Menzel",
    cover: "https://cdn.wuyilin18.top/music/cover/let-it-go.jpg",
    url: "https://cdn.wuyilin18.top/music/Let It Go.mp3",
    duration: 224,
  },
];

export const CompactMusicPlayer: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // 播放/暂停控制
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
    setCurrentSong((prev) => (prev + 1) % playlist.length);
  };

  // 上一首
  const prevSong = () => {
    setCurrentSong((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  // 更新进度条
  useEffect(() => {
    if (!audioRef.current) return;

    const updateProgress = () => {
      if (!audioRef.current) return;

      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      const percentage = (currentTime / duration) * 100;
      setProgress(percentage);
    };

    const intervalId = setInterval(updateProgress, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // 当歌曲切换时，如果正在播放，则加载并播放新歌曲
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.load();
      audioRef.current.play().catch((err) => console.error("播放失败:", err));
    }
  }, [currentSong, isPlaying]);

  // 点击进度条
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;

    if (audioRef.current.duration) {
      audioRef.current.currentTime = percentage * audioRef.current.duration;
      setProgress(percentage * 100);
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const song = playlist[currentSong];

  return (
    <div className="flex flex-col w-[200px] rounded-lg overflow-hidden bg-[#1a1a1a] text-white">
      {/* 封面图片 */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-indigo-800 to-purple-900">
        {song.cover && (
          <div className="relative w-full h-full">
            <Image
              src={song.cover}
              alt={song.title}
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>
        )}
      </div>

      {/* 歌曲信息 */}
      <div className="p-3 pb-2">
        <h3 className="text-lg font-bold truncate">{song.title}</h3>
        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
      </div>

      {/* 进度条 */}
      <div className="px-3 pb-2">
        <div
          ref={progressBarRef}
          className="w-full h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-gradient-to-r from-[#ff4d9d] to-[#ff1493]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 时间显示 */}
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
          <span>{formatTime(song.duration)}</span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-between px-3 pb-4">
        <button
          className="text-gray-400 hover:text-white p-1"
          onClick={prevSong}
        >
          <SkipBack size={18} />
        </button>

        <button
          className="w-12 h-12 flex items-center justify-center bg-[#ff4d9d] rounded-full text-white"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause size={24} />
          ) : (
            <Play size={24} className="ml-1" />
          )}
        </button>

        <button
          className="text-gray-400 hover:text-white p-1"
          onClick={nextSong}
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* 音频元素 */}
      <audio
        ref={audioRef}
        src={song.url}
        onEnded={nextSong}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
};
