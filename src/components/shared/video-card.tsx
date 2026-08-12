'use client';

import { useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'motion/react';
import { Pause, Play } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type VideoCardProps = {
  src: string;
  poster?: string;
  className?: string;
  loop?: boolean;
  mutedOnHover?: boolean; // default true to satisfy autoplay policy
};

/**
 * Hover-to-play video player with a click-to-toggle overlay and a
 * playing/paused badge. Ported from blihops-web
 * (`src/components/shared/video-card.tsx`) so both apps share the same
 * player UX.
 */
export function VideoCard({
  src,
  poster,
  className,
  loop = false,
  mutedOnHover = true,
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userStarted, setUserStarted] = useState(false); // true when user clicked play
  const [prevMuted, setPrevMuted] = useState<boolean | null>(null);

  // Play muted on hover (if allowed). Pause on leave.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let ignore = false;

    const doPlayMuted = async () => {
      if (!video) return;
      // Save previous muted state first time
      if (prevMuted === null) setPrevMuted(video.muted);

      if (mutedOnHover) {
        video.muted = true;
      }
      try {
        await video.play();
        if (!ignore) setIsPlaying(true);
      } catch {
        // autoplay blocked (shouldn't if muted) — ignore
        if (!ignore) setIsPlaying(false);
      }
    };

    const doPause = () => {
      if (!video) return;
      video.pause();
      setIsPlaying(false);
      // restore mute state only if user didn't start playback manually
      if (!userStarted && prevMuted !== null) {
        video.muted = prevMuted;
      }
    };

    if (isHovering && !userStarted) {
      // only auto play on hover when user hasn't manually started playback
      void doPlayMuted();
    } else if (!isHovering && !userStarted) {
      doPause();
    }

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovering, mutedOnHover, userStarted]);

  // If user clicks play icon: toggle playback and treat as user gesture
  const handleIconClick = async () => {
    const video = videoRef.current;
    if (!video) return;

    // If not playing, user-initiated play: unmute so user hears audio
    if (!isPlaying) {
      // Mark that user started explicit playback
      setUserStarted(true);
      // restore to unmuted so clicking plays with sound
      video.muted = false;
      setPrevMuted(false);
      try {
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        // if play fails, keep state consistent
        console.error('Play failed:', err);
        setIsPlaying(false);
      }
    } else {
      // pause on click
      video.pause();
      setIsPlaying(false);
    }
  };

  // keep visual play state in sync with native events (in case video ends or is paused externally)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setUserStarted(false); // allow hover autoplay after end if desired
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-md border border-border bg-card shadow-sm',
        className,
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop={loop}
        playsInline
        // do not set autoplay here — we control playback on hover/click
        className="h-full w-full object-cover"
      />

      {/* Overlay: Play/Pause button (always visible but subtle) */}
      <AnimatePresence>
        {/* show when not playing OR when hovered (to allow pause by clicking) */}
        {(isHovering || !isPlaying) && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                void handleIconClick();
              }}
              className="pointer-events-auto h-16 w-16 rounded-full bg-black/20 text-white hover:bg-black/40"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8" />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* small subtle status badge bottom-left */}
      <div className="absolute bottom-3 left-3 rounded-full bg-black/20 px-2 py-1 text-xs text-muted-foreground">
        {isPlaying ? 'Playing' : 'Paused'}
      </div>
    </div>
  );
}
