import { useCallback, useEffect, useRef, useState } from 'react';

type UseResendTimerOptions = {
  durationSeconds?: number;
  autoStart?: boolean;
  onComplete?: () => void;
};

type UseResendTimerResult = {
  secondsLeft: number;
  isActive: boolean;
  start: () => void;
  stop: () => void;
  restart: () => void;
};

export const useResendTimer = (
  options: UseResendTimerOptions = {}
): UseResendTimerResult => {
  const { durationSeconds = 30, autoStart = true, onComplete } = options;
  const [secondsLeft, setSecondsLeft] = useState<number>(
    autoStart ? durationSeconds : 0
  );
  const [isRunning, setIsRunning] = useState(autoStart);
  const onCompleteRef = useRef(onComplete);

  // Keep callback up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const start = useCallback((): void => {
    setSecondsLeft(durationSeconds);
    setIsRunning(true);
  }, [durationSeconds]);

  const stop = useCallback((): void => {
    setIsRunning(false);
    setSecondsLeft(0);
  }, []);

  const restart = useCallback((): void => {
    start();
  }, [start]);

  // Manage the timer interval
  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => {
        const next = Math.max(prev - 1, 0);
        if (next === 0) {
          setIsRunning(false);
          onCompleteRef.current?.();
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning, secondsLeft]); // Only re-run if running state or 'positive seconds' status changes

  return {
    secondsLeft,
    isActive: isRunning && secondsLeft > 0,
    start,
    stop,
    restart,
  };
};
