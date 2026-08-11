import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Subtitles, CheckCircle } from 'lucide-react';

export default function VideoPlayer({ videoUrl, captionsVtt, title, onProgressUpdate, onCompleted }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 1;
      setCurrentTime(current);
      setDuration(total);
      setProgress((current / total) * 100);

      if (onProgressUpdate) {
        onProgressUpdate(Math.floor(current));
      }

      if (current >= total - 2 && onCompleted) {
        onCompleted();
      }
    }
  };

  const handleSeek = (e) => {
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl group">
      <video
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        className="w-full aspect-video object-cover cursor-pointer"
      >
        {captionsVtt && (
          <track
            kind="captions"
            srcLang="en"
            label="English Captions"
            src={`data:text/vtt;charset=utf-8,${encodeURIComponent(captionsVtt)}`}
            default={captionsOn}
          />
        )}
      </video>

      {/* Video Overlay Play Button when Paused */}
      {!isPlaying && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-110 transition-transform">
            <Play className="w-8 h-8 fill-black translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Video Control Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 opacity-90 group-hover:opacity-100 transition-opacity">
        
        {/* Seek Bar */}
        <input
          type="range"
          min="0"
          max="100"
          value={progress || 0}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-3"
        />

        <div className="flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="p-1 hover:text-amber-400">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button onClick={toggleMute} className="p-1 hover:text-amber-400">
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <span className="font-mono text-slate-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {captionsVtt && (
              <button 
                onClick={() => setCaptionsOn(!captionsOn)}
                className={`p-1.5 rounded transition-colors ${captionsOn ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400'}`}
                title="Toggle Captions"
              >
                <Subtitles className="w-4 h-4" />
              </button>
            )}

            <button onClick={toggleFullscreen} className="p-1 hover:text-amber-400">
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
