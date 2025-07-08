import type React from "react";
import {useCallback, useEffect, useState} from "react";

interface IVideoState {
  isPlaying: boolean;
  isFullScreen: boolean;
  currentTime: number;
  duration: number; // all time in seconds
  volume: number; // from 0 to 1
  isMuted?: boolean; // optional, if you want to track mute state
}

const initVideoState = {
  isPlaying: false,
  isFullScreen: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
};

export function useVideoPlayer(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [videoState, setVideoState] = useState<IVideoState>(initVideoState);

  const updateVideoSate = useCallback((newState: Partial<IVideoState>) => {
    setVideoState((prevState) => ({...prevState, ...newState}));
  }, []);

  const handlePlay = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    if (videoState.isPlaying) {
      video.pause();
      updateVideoSate({isPlaying: false});
      return;
    }

    video.play();
    updateVideoSate({isPlaying: true});
  }, [videoState.isPlaying, updateVideoSate, videoRef]);

  const handleFullScreen = useCallback(
    (containerRef: React.RefObject<HTMLDivElement | null>) => {
      const container = containerRef.current;

      if (!container) return;

      if (videoState.isFullScreen) {
        document.exitFullscreen();
        updateVideoSate({isFullScreen: false});
        return;
      }

      container.requestFullscreen();
      updateVideoSate({isFullScreen: true});
    },
    [videoState.isFullScreen, updateVideoSate, videoRef],
  );

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = useCallback(
    (value: number) => {
      const video = videoRef.current;
      if (!video) return;

      video.currentTime = value;
      updateVideoSate({currentTime: value});
    },
    [videoState.currentTime, updateVideoSate, videoRef],
  );

  const handleChangeVolume = useCallback(
    (value: number) => {
      const video = videoRef.current;
      if (!video) return;

      video.volume = value;
      updateVideoSate({volume: value, isMuted: value === 0});
    },
    [videoState.isMuted, updateVideoSate, videoRef],
  );

  const hanldeMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    updateVideoSate({isMuted: !videoState.isMuted});
  }, [videoState.isMuted, updateVideoSate, videoRef]);

  useEffect(() => {
    const video = videoRef.current;

    const handleTimeUpdate = () => {
      updateVideoSate({currentTime: video?.currentTime});
    };
    const handleLoadedMetadata = () => {
      updateVideoSate({duration: video?.duration});
    };

    video?.addEventListener("timeupdate", handleTimeUpdate);
    video?.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video?.removeEventListener("timeupdate", handleTimeUpdate);
      video?.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  return {
    videoState,
    handlePlay,
    handleFullScreen,
    handleSeek,
    handleChangeVolume,
    hanldeMute,
    formatTime,
  };
}
