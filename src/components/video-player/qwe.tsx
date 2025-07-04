import React, { useRef, useState, useEffect, useCallback } from 'react';

// Types
interface VideoPlayerProps {
    src: string;
    poster?: string;
    title?: string;
}

interface VideoState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    isFullscreen: boolean;
    showControls: boolean;
    isLoading: boolean;
    playbackRate: number;
    showSettings: boolean;
    showVolumeSlider: boolean;
    buffered: number;
    isHovering: boolean;
}

// Constants
const KEYBOARD_SHORTCUTS = {
    SPACE: 'Space',
    F: 'KeyF',
    M: 'KeyM',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
} as const;

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const SKIP_TIME = 10;
const VOLUME_STEP = 0.1;
const CONTROLS_HIDE_DELAY = 3000;

// Custom hooks
const useVideoPlayer = (videoRef: React.RefObject<HTMLVideoElement>) => {
    const [state, setState] = useState<VideoState>({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        isMuted: false,
        isFullscreen: false,
        showControls: true,
        isLoading: true,
        playbackRate: 1,
        showSettings: false,
        showVolumeSlider: false,
        buffered: 0,
        isHovering: false,
    });

    const updateState = useCallback((updates: Partial<VideoState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (state.isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        updateState({ isPlaying: !state.isPlaying });
    }, [state.isPlaying, updateState, videoRef]);

    const seek = useCallback((time: number) => {
        const video = videoRef.current;
        if (!video) return;

        const clampedTime = Math.max(0, Math.min(video.duration || 0, time));
        video.currentTime = clampedTime;
        updateState({ currentTime: clampedTime });
    }, [updateState, videoRef]);

    const skipTime = useCallback((seconds: number) => {
        const video = videoRef.current;
        if (!video) return;

        const newTime = video.currentTime + seconds;
        seek(newTime);
    }, [seek, videoRef]);

    const changeVolume = useCallback((newVolume: number) => {
        const video = videoRef.current;
        if (!video) return;

        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        video.volume = clampedVolume;
        updateState({
            volume: clampedVolume,
            isMuted: clampedVolume === 0
        });
    }, [updateState, videoRef]);

    const toggleMute = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (state.isMuted || video.volume === 0) {
            const newVolume = state.volume || 0.5;
            video.volume = newVolume;
            video.muted = false;
            updateState({ volume: newVolume, isMuted: false });
        } else {
            video.muted = true;
            updateState({ isMuted: true });
        }
    }, [state.isMuted, state.volume, updateState, videoRef]);

    const changePlaybackRate = useCallback((rate: number) => {
        const video = videoRef.current;
        if (!video) return;

        video.playbackRate = rate;
        updateState({ playbackRate: rate, showSettings: false });
    }, [updateState, videoRef]);

    return {
        state,
        updateState,
        togglePlay,
        seek,
        skipTime,
        changeVolume,
        toggleMute,
        changePlaybackRate,
    };
};

const useKeyboardShortcuts = (
    containerRef: React.RefObject<HTMLDivElement>,
    actions: {
        togglePlay: () => void;
        skipTime: (seconds: number) => void;
        toggleMute: () => void;
        changeVolume: (volume: number) => void;
        toggleFullscreen: () => void;
    },
    currentVolume: number
) => {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const video = containerRef.current?.querySelector('video') as HTMLVideoElement;
        if (!video) return;

        switch (e.code) {
            case KEYBOARD_SHORTCUTS.SPACE:
                e.preventDefault();
                actions.togglePlay();
                break;
            case KEYBOARD_SHORTCUTS.F:
                e.preventDefault();
                actions.toggleFullscreen();
                break;
            case KEYBOARD_SHORTCUTS.M:
                e.preventDefault();
                actions.toggleMute();
                break;
            case KEYBOARD_SHORTCUTS.ARROW_LEFT:
                e.preventDefault();
                actions.skipTime(-SKIP_TIME);
                break;
            case KEYBOARD_SHORTCUTS.ARROW_RIGHT:
                e.preventDefault();
                actions.skipTime(SKIP_TIME);
                break;
            case KEYBOARD_SHORTCUTS.ARROW_UP:
                e.preventDefault();
                actions.changeVolume(currentVolume + VOLUME_STEP);
                break;
            case KEYBOARD_SHORTCUTS.ARROW_DOWN:
                e.preventDefault();
                actions.changeVolume(currentVolume - VOLUME_STEP);
                break;
        }
    }, [actions, currentVolume]);

    useEffect(() => {
        const handleKeyboardEvent = (e: KeyboardEvent) => {
            const isVideoPlayerFocused = containerRef.current?.contains(document.activeElement) ||
                document.activeElement === document.body;
            if (isVideoPlayerFocused) {
                handleKeyDown(e);
            }
        };

        document.addEventListener('keydown', handleKeyboardEvent);
        return () => document.removeEventListener('keydown', handleKeyboardEvent);
    }, [handleKeyDown]);
};

// Utility functions
const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Sub-components
const LoadingSpinner = () => (
    <div className="loading-spinner" />
);

const PlayOverlay = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="play-overlay">
        <div className="play-icon" />
    </button>
);

const VideoTitle = ({ title, show }: { title: string; show: boolean }) => (
    <div className={`video-title ${show ? '' : 'hidden'}`}>
        {title}
    </div>
);

const ProgressBar = ({
    progressRef,
    buffered,
    currentTime,
    duration,
    onSeek
}: {
    progressRef: React.RefObject<HTMLDivElement>;
    buffered: number;
    currentTime: number;
    duration: number;
    onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
}) => {
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="progress-container">
            <div ref={progressRef} className="progress-bar" onClick={onSeek}>
                <div className="progress-buffered" style={{ width: `${buffered}%` }} />
                <div className="progress-filled" style={{ width: `${progressPercent}%` }}>
                    <div className="progress-thumb" />
                </div>
            </div>
        </div>
    );
};

const VolumeControl = ({
    volume,
    isMuted,
    onToggleMute,
    onVolumeChange,
    volumeSliderRef
}: {
    volume: number;
    isMuted: boolean;
    onToggleMute: () => void;
    onVolumeChange: (e: React.MouseEvent<HTMLDivElement>) => void;
    volumeSliderRef: React.RefObject<HTMLDivElement>;
}) => (
    <div className="volume-container">
        <button onClick={onToggleMute} className="control-btn">
            <span className={`icon ${isMuted || volume === 0 ? 'icon-volume-mute' : 'icon-volume'}`} />
        </button>
        <div ref={volumeSliderRef} className="volume-slider" onClick={onVolumeChange}>
            <div
                className="volume-filled"
                style={{ height: `${(isMuted ? 0 : volume) * 100}%` }}
            />
        </div>
    </div>
);

const SettingsMenu = ({
    show,
    playbackRate,
    onRateChange
}: {
    show: boolean;
    playbackRate: number;
    onRateChange: (rate: number) => void;
}) => {
    if (!show) return null;

    return (
        <div className="settings-menu">
            <div className="settings-section">
                <div className="settings-title">Playback Speed</div>
                {PLAYBACK_RATES.map(rate => (
                    <button
                        key={rate}
                        onClick={() => onRateChange(rate)}
                        className={`settings-option ${playbackRate === rate ? 'active' : ''}`}
                    >
                        {rate === 1 ? 'Normal' : `${rate}x`}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Main component
export const VideoPlayers: React.FC<VideoPlayerProps> = ({
    src,
    poster = "",
    title = "Video Player"
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const volumeSliderRef = useRef<HTMLDivElement>(null);

    const {
        state,
        updateState,
        togglePlay,
        seek,
        skipTime,
        changeVolume,
        toggleMute,
        changePlaybackRate,
    } = useVideoPlayer(videoRef);

    // Fullscreen functionality
    const toggleFullscreen = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        if (!state.isFullscreen) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        updateState({ isFullscreen: !state.isFullscreen });
    }, [state.isFullscreen, updateState]);

    // Keyboard shortcuts
    useKeyboardShortcuts(containerRef, {
        togglePlay,
        skipTime,
        toggleMute,
        changeVolume,
        toggleFullscreen,
    }, state.volume);

    // Event handlers
    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const progressBar = progressRef.current;
        if (!progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = (clickX / rect.width) * state.duration;
        seek(newTime);
    }, [seek, state.duration]);

    const handleVolumeSliderClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const slider = volumeSliderRef.current;
        if (!slider) return;

        const rect = slider.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const newVolume = 1 - (clickY / rect.height);
        changeVolume(newVolume);
    }, [changeVolume]);

    // Video event listeners
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => updateState({ currentTime: video.currentTime });
        const handleLoadedMetadata = () => updateState({ duration: video.duration });
        const handleProgress = () => {
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                const bufferedPercent = (bufferedEnd / video.duration) * 100;
                updateState({ buffered: bufferedPercent });
            }
        };
        const handleCanPlay = () => updateState({ isLoading: false });
        const handleWaiting = () => updateState({ isLoading: true });

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('progress', handleProgress);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('canplaythrough', handleCanPlay);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('progress', handleProgress);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('canplaythrough', handleCanPlay);
        };
    }, [updateState]);

    // Auto-hide controls
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (state.isPlaying && state.showControls && !state.isHovering) {
            timeout = setTimeout(() => updateState({ showControls: false }), CONTROLS_HIDE_DELAY);
        }
        return () => clearTimeout(timeout);
    }, [state.isPlaying, state.showControls, state.isHovering, updateState]);

    return (
        <>
            <style>{`
        .video-player {
          position: relative;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .video-element {
          width: 100%;
          height: auto;
          display: block;
        }

        .loading-spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 48px;
          height: 48px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .play-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 0, 0, 0.9);
          border: none;
          border-radius: 50%;
          width: 80px;
          height: 80px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .play-overlay:hover {
          background: rgba(255, 0, 0, 1);
          transform: translate(-50%, -50%) scale(1.1);
        }

        .play-icon {
          width: 0;
          height: 0;
          border-left: 24px solid white;
          border-top: 12px solid transparent;
          border-bottom: 12px solid transparent;
          margin-left: 4px;
        }

        .controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.7));
          padding: 20px 16px 16px;
          transition: opacity 0.3s ease;
        }

        .controls.hidden {
          opacity: 0;
          pointer-events: none;
        }

        .progress-container {
          margin-bottom: 16px;
          position: relative;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          cursor: pointer;
          position: relative;
          transition: height 0.2s ease;
        }

        .progress-bar:hover {
          height: 6px;
        }

        .progress-buffered {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 2px;
        }

        .progress-filled {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: #ff0000;
          border-radius: 2px;
        }

        .progress-thumb {
          position: absolute;
          top: 50%;
          right: -6px;
          transform: translateY(-50%);
          width: 12px;
          height: 12px;
          background: #ff0000;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .progress-bar:hover .progress-thumb {
          opacity: 1;
        }

        .controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
        }

        .controls-left,
        .controls-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .control-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .volume-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .volume-slider {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 80px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          margin-bottom: 8px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .volume-container:hover .volume-slider {
          opacity: 1;
        }

        .volume-filled {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: white;
          border-radius: 2px;
        }

        .time-display {
          font-family: monospace;
          font-size: 14px;
          margin: 0 8px;
        }

        .settings-menu {
          position: absolute;
          bottom: 100%;
          right: 0;
          background: rgba(0, 0, 0, 0.9);
          border-radius: 4px;
          padding: 8px 0;
          min-width: 150px;
          margin-bottom: 8px;
        }

        .settings-section {
          padding: 8px 16px;
        }

        .settings-title {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #ccc;
        }

        .settings-option {
          display: block;
          width: 100%;
          background: none;
          border: none;
          color: white;
          text-align: left;
          padding: 4px 8px;
          cursor: pointer;
          border-radius: 2px;
          font-size: 14px;
        }

        .settings-option:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .settings-option.active {
          background: #ff0000;
        }

        .video-title {
          position: absolute;
          top: 16px;
          left: 16px;
          color: white;
          font-size: 18px;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          transition: opacity 0.3s ease;
        }

        .video-title.hidden {
          opacity: 0;
        }

        .icon {
          width: 20px;
          height: 20px;
          display: inline-block;
        }

        .icon-play::before {
          content: '';
          display: block;
          width: 0;
          height: 0;
          border-left: 12px solid currentColor;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          margin-left: 2px;
        }

        .icon-pause::before {
          content: '';
          display: block;
          width: 12px;
          height: 16px;
          background: currentColor;
          mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E");
          background: linear-gradient(90deg, currentColor 0%, currentColor 35%, transparent 35%, transparent 65%, currentColor 65%, currentColor 100%);
        }

        .icon-volume::before {
          content: '🔊';
          font-size: 16px;
        }

        .icon-volume-mute::before {
          content: '🔇';
          font-size: 16px;
        }

        .icon-fullscreen::before {
          content: '⛶';
          font-size: 16px;
        }

        .icon-settings::before {
          content: '⚙️';
          font-size: 16px;
        }

        .icon-skip-back::before {
          content: '⏪';
          font-size: 16px;
        }

        .icon-skip-forward::before {
          content: '⏩';
          font-size: 16px;
        }
      `}</style>

            <div
                ref={containerRef}
                className="video-player"
                onMouseEnter={() => updateState({ isHovering: true })}
                onMouseLeave={() => updateState({ isHovering: false })}
                onMouseMove={() => updateState({ showControls: true })}
            >
                <video
                    ref={videoRef}
                    src={src}
                    poster={poster}
                    className="video-element"
                    onClick={togglePlay}
                    onDoubleClick={toggleFullscreen}
                />

                {state.isLoading && <LoadingSpinner />}

                {!state.isPlaying && !state.isLoading && (
                    <PlayOverlay onClick={togglePlay} />
                )}

                {title && (
                    <VideoTitle title={title} show={state.showControls} />
                )}

                <div className={`controls ${state.showControls ? '' : 'hidden'}`}>
                    <ProgressBar
                        progressRef={progressRef}
                        buffered={state.buffered}
                        currentTime={state.currentTime}
                        duration={state.duration}
                        onSeek={handleSeek}
                    />

                    <div className="controls-row">
                        <div className="controls-left">
                            <button onClick={togglePlay} className="control-btn">
                                <span className={`icon ${state.isPlaying ? 'icon-pause' : 'icon-play'}`} />
                            </button>

                            <button onClick={() => skipTime(-SKIP_TIME)} className="control-btn">
                                <span className="icon icon-skip-back" />
                            </button>

                            <button onClick={() => skipTime(SKIP_TIME)} className="control-btn">
                                <span className="icon icon-skip-forward" />
                            </button>

                            <VolumeControl
                                volume={state.volume}
                                isMuted={state.isMuted}
                                onToggleMute={toggleMute}
                                onVolumeChange={handleVolumeSliderClick}
                                volumeSliderRef={volumeSliderRef}
                            />

                            <span className="time-display">
                                {formatTime(state.currentTime)} / {formatTime(state.duration)}
                            </span>
                        </div>

                        <div className="controls-right">
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => updateState({ showSettings: !state.showSettings })}
                                    className="control-btn"
                                >
                                    <span className="icon icon-settings" />
                                </button>

                                <SettingsMenu
                                    show={state.showSettings}
                                    playbackRate={state.playbackRate}
                                    onRateChange={changePlaybackRate}
                                />
                            </div>

                            <button onClick={toggleFullscreen} className="control-btn">
                                <span className="icon icon-fullscreen" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
