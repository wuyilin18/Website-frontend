"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  ListMusic,
  X,
  Shuffle,
  ArrowRight,
  Repeat,
  RotateCw,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Song {
  id: number;
  title: string;
  artist: string;
  cover: string;
  url: string;
  duration: number;
}

// 播放模式枚举
enum PlayMode {
  SEQUENTIAL = 0, // 顺序播放
  LIST_LOOP = 1, // 列表循环
  REPEAT_ONE = 2, // 单曲循环
  SHUFFLE = 3, // 随机播放
  PLAY_ONCE = 4, // 单曲播放（播放完不循环）
}

const playlist: Song[] = [
  {
    id: 1,
    title: "不凡",
    artist: "王铮亮",
    cover:
      "https://p1.music.126.net/lvfb_64QYmbib7ccHgDNJA==/109951165165604312.jpg",
    url: "http://music.163.com/song/media/outer/url?id=1465288702.mp3",
    duration: 211, // 3:31
  },
  {
    id: 2,
    title: "知我",
    artist: "国风堂,哦漏",
    cover:
      "http://p1.music.126.net/_etyUh1ofScyTMFArsJXWg==/109951164415301539.jpg",
    url: "http://music.163.com/song/media/outer/url?id=1394167216.mp3",
    duration: 277,
  },
  {
    id: 3,
    title: "问星",
    artist: "Mr.mo",
    cover:
      "https://y.gtimg.cn/music/photo_new/T002R300x300M000002Uda3M4BMXDu.jpg",
    url: "http://ws.stream.qqmusic.qq.com/C4000033pgzG1IvwnY.m4a?guid=541863622&vkey=694F128EC66BB43F5B434520F53BFE490105BC4830C36E460B9A5AEF303A73A1282043DDB94E51E06E92D4E85430A7389BA10F8980F2019D__v21e2a1873&uin=&fromtag=120032",
    duration: 225,
  },
  {
    id: 4,
    title: "Let It Go",
    artist: "Idina Menzel",
    cover:
      "https://y.gtimg.cn/music/photo_new/T002R300x300M000000nmCPL1H8bES.jpg",
    url: "http://ws.stream.qqmusic.qq.com/C400000Xmkit1Zsiq8.m4a?guid=817788325&vkey=AA49A201B2F27DD4DF625234400508487BA944FAA2A0A19505D3F6C5051B3A7E9F4E49A9C61266B962979AB6F6580B1C317531EF884865AE__v2b9ab84e&uin=&fromtag=120032",
    duration: 224, // 3:44
  },
  {
    id: 5,
    title: "Show Yourself",
    artist: "Idina Menzel & Evan Rachel Wood",
    cover:
      "http://p1.music.126.net/JuDGtyz4G5ia41YBNpF7JQ==/109951169060932110.jpg",
    url: "http://music.163.com/song/media/outer/url?id=1403858544.mp3",
    duration: 260, // 4:20
  },
  {
    id: 6,
    title: "DARK ARIA <LV2>",
    artist: "SawanoHiroyuki[nZk] & XAI",
    cover:
      "http://p1.music.126.net/-HQJxPCvUPUYwjFgh_MulQ==/109951169249504499.jpg",
    url: "http://music.163.com/song/media/outer/url?id=2629027034.mp3",
    duration: 141, // 2:21
  },
  {
    id: 7,
    title: "SHADOWBORN",
    artist: "澤野弘之 & Benjamin & mpi",
    cover:
      "http://p1.music.126.net/JnrAm-ESo_b9kANYA9VV0w==/109951170355469751.jpg",
    url: "http://music.163.com/song/media/outer/url?id=2663598795.mp3",
    duration: 191, // 3:11
  },
];

export const FullMusicPlayer: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [playMode, setPlayMode] = useState<PlayMode>(PlayMode.SEQUENTIAL);
  const [showPlaylist, setShowPlaylist] = useState<boolean>(false);
  const [modeTooltip, setModeTooltip] = useState<boolean>(false);

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
  };

  // 获取下一首歌曲索引 (基于当前播放模式)
  const getNextSongIndex = (): number => {
    switch (playMode) {
      case PlayMode.SEQUENTIAL:
        // 顺序播放：到达最后一首歌就停止
        return currentSong < playlist.length - 1
          ? currentSong + 1
          : currentSong;
      case PlayMode.LIST_LOOP:
        // 列表循环：循环播放整个列表
        return (currentSong + 1) % playlist.length;
      case PlayMode.REPEAT_ONE:
        // 单曲循环：继续播放当前歌曲
        return currentSong;
      case PlayMode.SHUFFLE:
        // 随机播放：随机选择一首不同的歌
        const newIndex = Math.floor(Math.random() * (playlist.length - 1));
        return newIndex >= currentSong ? newIndex + 1 : newIndex;
      case PlayMode.PLAY_ONCE:
        // 单曲播放：与顺序播放相同
        return currentSong < playlist.length - 1
          ? currentSong + 1
          : currentSong;
      default:
        return (currentSong + 1) % playlist.length;
    }
  };

  // 获取上一首歌曲索引
  const getPrevSongIndex = (): number => {
    switch (playMode) {
      case PlayMode.SEQUENTIAL:
      case PlayMode.LIST_LOOP:
      case PlayMode.PLAY_ONCE:
        // 顺序播放、列表循环、单曲播放：常规返回上一首
        return (currentSong - 1 + playlist.length) % playlist.length;
      case PlayMode.REPEAT_ONE:
        // 单曲循环：继续播放当前歌曲
        return currentSong;
      case PlayMode.SHUFFLE:
        // 随机播放：随机选择一首不同的歌
        const newIndex = Math.floor(Math.random() * (playlist.length - 1));
        return newIndex >= currentSong ? newIndex + 1 : newIndex;
      default:
        return (currentSong - 1 + playlist.length) % playlist.length;
    }
  };

  // 下一首
  const nextSong = () => {
    setCurrentSong(getNextSongIndex());
  };

  // 上一首
  const prevSong = () => {
    setCurrentSong(getPrevSongIndex());
  };

  // 切换播放模式
  const togglePlayMode = () => {
    const nextMode = (playMode + 1) % 5;
    setPlayMode(nextMode);

    // 显示模式提示，并在短时间后隐藏
    setModeTooltip(true);
    setTimeout(() => setModeTooltip(false), 1500);
  };

  // 渲染播放模式图标
  const renderPlayModeIcon = (size: number = 20) => {
    switch (playMode) {
      case PlayMode.SEQUENTIAL:
        return <ArrowRight size={size} />; // 顺序播放 - 右箭头
      case PlayMode.LIST_LOOP:
        return <RotateCw size={size} />; // 列表循环
      case PlayMode.REPEAT_ONE:
        return <Repeat size={size} />; // 单曲循环
      case PlayMode.SHUFFLE:
        return <Shuffle size={size} />; // 随机播放
      case PlayMode.PLAY_ONCE:
        return <ArrowRight size={size} />; // 单曲播放
      default:
        return <ArrowRight size={size} />;
    }
  };

  // 渲染播放模式文本
  const getPlayModeText = () => {
    switch (playMode) {
      case PlayMode.SEQUENTIAL:
        return "顺序播放";
      case PlayMode.LIST_LOOP:
        return "列表循环";
      case PlayMode.REPEAT_ONE:
        return "单曲循环";
      case PlayMode.SHUFFLE:
        return "随机播放";
      case PlayMode.PLAY_ONCE:
        return "单曲播放";
      default:
        return "顺序播放";
    }
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

    audioRef.current.load();
    if (isPlaying) {
      audioRef.current.play().catch((err) => console.error("播放失败:", err));
    }
  }, [currentSong]);

  // 歌曲结束时处理
  const handleSongEnd = () => {
    if (playMode === PlayMode.REPEAT_ONE) {
      // 单曲循环模式：重新播放当前歌曲
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .catch((err) => console.error("重新播放失败:", err));
      }
    } else if (playMode === PlayMode.PLAY_ONCE) {
      // 单曲播放模式：播放结束后不做任何操作
      setIsPlaying(false);
    } else {
      // 其他模式：播放下一首
      const nextIndex = getNextSongIndex();
      setCurrentSong(nextIndex);

      // 特别处理列表循环模式，确保自动开始播放
      if (playMode === PlayMode.LIST_LOOP && nextIndex === 0) {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current
              .play()
              .catch((err) => console.error("自动播放失败:", err));
          }
        }, 100);
      }
    }
  };

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

  // 点击播放列表中的歌曲
  const handlePlaylistItemClick = (index: number) => {
    setCurrentSong(index);
    setShowPlaylist(false);

    if (!isPlaying) {
      setIsPlaying(true);
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
    <div className="w-full h-full flex flex-col rounded-[20px] overflow-hidden max-h-[220px] bg-black">
      {/* 主播放器界面 */}
      <div className="flex flex-col h-full">
        {/* 上部布局：左侧封面和右侧信息 */}
        <div className="grid grid-cols-2 gap-1 px-2 pt-2">
          {/* 左侧：封面图片 */}
          <div className="flex-shrink-0">
            <div className="relative w-full aspect-square rounded-md overflow-hidden shadow-md border border-neutral-700">
              {song.cover && (
                <Image
                  src={song.cover}
                  alt={song.title}
                  fill
                  className="object-cover"
                  sizes="100px"
                />
              )}
            </div>
          </div>

          {/* 右侧：歌曲信息和进度 */}
          <div className="flex flex-col justify-center">
            <h3 className="text-sm font-bold text-white truncate">
              {song.title}
            </h3>
            <p className="text-xs text-neutral-400 truncate mb-2">
              {song.artist}
            </p>

            {/* 时间显示 */}
            <div className="flex justify-between text-[9px] text-neutral-500">
              <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
              <span>{formatTime(song.duration)}</span>
            </div>

            {/* 进度条 */}
            <div className="mt-1">
              <div
                ref={progressBarRef}
                className="w-full h-1 bg-neutral-700 rounded-full overflow-hidden cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-cyan-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-between px-3 py-2 mt-auto border-t border-neutral-800 bg-black">
          {/* 播放模式按钮 */}
          <button
            className={`p-0.5 rounded-full ${
              playMode === PlayMode.SEQUENTIAL
                ? "text-neutral-400"
                : playMode === PlayMode.REPEAT_ONE
                ? "text-cyan-400"
                : "text-cyan-400"
            } relative hover:text-cyan-300 transition-colors`}
            onClick={togglePlayMode}
          >
            <div className="relative">
              {renderPlayModeIcon(16)}

              {/* 模式提示 */}
              <AnimatePresence>
                {modeTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 bg-neutral-800 text-white text-[8px] py-0.5 px-1 rounded whitespace-nowrap border border-neutral-700"
                  >
                    {getPlayModeText()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </button>

          {/* 上一曲 */}
          <button
            className="p-0.5 text-neutral-400 hover:text-cyan-300 transition-colors"
            onClick={prevSong}
          >
            <SkipBack size={16} />
          </button>

          {/* 播放/暂停 */}
          <button
            className="w-9 h-9 flex items-center justify-center bg-cyan-500 rounded-full text-black shadow-md hover:bg-cyan-400 transition-colors"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} className="ml-0.5" />
            )}
          </button>

          {/* 下一曲 */}
          <button
            className="p-0.5 text-neutral-400 hover:text-cyan-300 transition-colors"
            onClick={nextSong}
          >
            <SkipForward size={16} />
          </button>

          {/* 播放列表按钮 */}
          <button
            className="p-0.5 rounded-full text-neutral-400 hover:text-cyan-300 transition-colors"
            onClick={() => setShowPlaylist(!showPlaylist)}
          >
            <ListMusic size={16} />
          </button>
        </div>
      </div>

      {/* 播放列表面板 */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="absolute inset-0 bg-gradient-to-b from-neutral-800 to-black rounded-[20px] shadow-lg border-t border-neutral-800"
            style={{ zIndex: 10 }}
          >
            <div className="flex items-center justify-between p-2 border-b border-neutral-800">
              <div className="flex items-center gap-1">
                <ListMusic size={14} className="text-neutral-400" />
                <h3 className="text-xs font-medium text-neutral-300">
                  Music list
                </h3>
              </div>
              <button onClick={() => setShowPlaylist(false)}>
                <X
                  size={14}
                  className="text-neutral-400 hover:text-neutral-200"
                />
              </button>
            </div>

            <div
              className="overflow-y-auto max-h-[calc(100%-40px)]"
              style={{
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {/* 使用内联样式隐藏WebKit浏览器的滚动条 */}
              {playlist.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2 border-b border-neutral-800 ${
                    currentSong === index ? "bg-neutral-800" : ""
                  } hover:bg-neutral-800/50 cursor-pointer transition-colors`}
                  onClick={() => handlePlaylistItemClick(index)}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0 border border-neutral-700">
                      <Image
                        src={item.cover}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                    <div className="max-w-[100px]">
                      <h4
                        className={`text-xs font-medium truncate ${
                          currentSong === index
                            ? "text-cyan-400"
                            : "text-neutral-300"
                        }`}
                      >
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-neutral-500 truncate">
                        {item.artist}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {currentSong === index && isPlaying ? (
                      <span className="text-[10px] text-cyan-400">Playing</span>
                    ) : (
                      <span className="text-[10px] text-neutral-500">
                        {formatTime(item.duration)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 音频元素 */}
      <audio
        ref={audioRef}
        src={song.url}
        onEnded={handleSongEnd}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
};
