import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Clock, Flame, Plus } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useLogFocusTime } from '@/features/tasks/hooks/useTaskMutations';
import { formatSeconds, calculateFocusProgress } from '@/utils/timeFormat';
import { CATEGORY_LABEL, PRIORITY_BADGE_VARIANT, PRIORITY_LABEL } from '@/features/tasks/taskDisplay';
import { cn } from '@/lib/cn';
import type { Task } from '@/types/task';

interface FocusTimerDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

const PRESET_DURATIONS = [
  { label: '25m Pomodoro', minutes: 25 },
  { label: '50m Deep Work', minutes: 50 },
  { label: '15m Sprint', minutes: 15 },
  { label: '5m Quick Review', minutes: 5 },
];

/** Plays a gentle audio chime when a study session completes using Web Audio API */
function playCompletionChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq: number, delayMs: number) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }, delayMs);
    };

    playTone(523.25, 0);   // C5
    playTone(659.25, 180); // E5
    playTone(783.99, 360); // G5
  } catch {
    // Audio playback optional, fail gracefully
  }
}

export function FocusTimerDialog({ task, open, onClose }: FocusTimerDialogProps) {
  const [activeTab, setActiveTab] = useState<'timer' | 'manual'>('timer');
  const [sessionMinutes, setSessionMinutes] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasFinished, setHasFinished] = useState<boolean>(false);
  const [manualMinutes, setManualMinutes] = useState<string>('30');

  const logFocusTime = useLogFocusTime();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Synchronize initial timer when preset changes
  const handleSelectPreset = (minutes: number) => {
    setIsRunning(false);
    setHasFinished(false);
    setSessionMinutes(minutes);
    setSecondsRemaining(minutes * 60);
  };

  const handleClose = () => {
    setIsRunning(false);
    setHasFinished(false);
    setSessionMinutes(25);
    setSecondsRemaining(25 * 60);
    onClose();
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer countdown tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setHasFinished(true);
            playCompletionChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  if (!task) return null;

  const totalSessionSeconds = sessionMinutes * 60;
  const elapsedSeconds = totalSessionSeconds - secondsRemaining;
  const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalSessionSeconds) * 100));

  const taskFocusProgress = calculateFocusProgress(task.loggedMinutes, task.estimatedMinutes);

  const handleSaveTimerSession = () => {
    if (!task) return;
    const minutesToLog = hasFinished ? sessionMinutes : elapsedMinutes;
    logFocusTime.mutate(
      { id: task.id, minutes: minutesToLog },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  const handleSaveManualLog = (minutes: number) => {
    if (!task || minutes <= 0) return;
    logFocusTime.mutate(
      { id: task.id, minutes },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Study Focus Session"
      description="Track Pomodoro intervals or log completed focus time for this task."
      className="max-w-lg"
    >
      <div className="space-y-5">
        {/* Task Header Context */}
        <div className="rounded-lg border border-default bg-surface-2/40 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold text-primary">{task.title}</h3>
            <div className="flex shrink-0 items-center gap-1.5">
              <Badge variant="neutral" className="text-xs">
                {CATEGORY_LABEL[task.category]}
              </Badge>
              <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]} className="text-xs">
                {PRIORITY_LABEL[task.priority]}
              </Badge>
            </div>
          </div>

          <div className="mt-2.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-secondary">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-accent" />
                Logged: <strong className="text-primary">{taskFocusProgress.formattedLogged}</strong>
              </span>
              {task.estimatedMinutes ? (
                <span>
                  Goal: <strong className="text-primary">{taskFocusProgress.formattedEstimated}</strong>
                </span>
              ) : (
                <span className="text-[11px] italic text-muted">No goal set</span>
              )}
            </div>

            {task.estimatedMinutes && (
              <ProgressBar
                value={task.loggedMinutes ?? 0}
                max={task.estimatedMinutes}
                label={`${taskFocusProgress.percentage}% of study target`}
              />
            )}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-default text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('timer')}
            className={cn(
              'flex-1 border-b-2 py-2 text-center transition-colors',
              activeTab === 'timer'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-secondary hover:text-primary',
            )}
          >
            Pomodoro Timer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={cn(
              'flex-1 border-b-2 py-2 text-center transition-colors',
              activeTab === 'manual'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-secondary hover:text-primary',
            )}
          >
            Quick Manual Log
          </button>
        </div>

        {activeTab === 'timer' ? (
          <div className="space-y-4">
            {/* Presets */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PRESET_DURATIONS.map((preset) => (
                <button
                  key={preset.minutes}
                  type="button"
                  disabled={isRunning}
                  onClick={() => handleSelectPreset(preset.minutes)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50',
                    sessionMinutes === preset.minutes
                      ? 'border-accent bg-accent/10 text-accent font-semibold'
                      : 'border-default bg-surface hover:bg-surface-2 text-secondary',
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Main Timer Display */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-default bg-surface-2/60 py-6">
              <span className="font-mono text-5xl font-extrabold tracking-tight text-primary">
                {formatSeconds(secondsRemaining)}
              </span>

              <p className="mt-1.5 text-xs font-medium text-secondary">
                {hasFinished ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-[color:var(--color-success-500)]">
                    <CheckCircle2 className="h-4 w-4" /> Session Complete! Great job!
                  </span>
                ) : isRunning ? (
                  <span className="inline-flex items-center gap-1 text-accent">
                    <Flame className="h-3.5 w-3.5 animate-pulse text-accent" /> Focus session active
                  </span>
                ) : (
                  <span>Ready to focus ({sessionMinutes} min target)</span>
                )}
              </p>

              {/* Progress indicator */}
              <div className="mt-4 w-48">
                <ProgressBar
                  value={elapsedSeconds}
                  max={totalSessionSeconds}
                  label={`${progressPercent}% completed`}
                />
              </div>

              {/* Controls */}
              <div className="mt-5 flex items-center gap-3">
                <Button
                  type="button"
                  variant={isRunning ? 'secondary' : 'primary'}
                  size="md"
                  onClick={() => {
                    if (hasFinished) {
                      handleSelectPreset(sessionMinutes);
                      setIsRunning(true);
                    } else {
                      setIsRunning(!isRunning);
                    }
                  }}
                  className="min-w-28 gap-2"
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-4 w-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" /> {hasFinished ? 'Restart' : 'Start'}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Reset Timer"
                  onClick={() => handleSelectPreset(sessionMinutes)}
                  disabled={!isRunning && secondsRemaining === totalSessionSeconds}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-default pt-4">
              <span className="text-xs text-secondary">
                {hasFinished ? (
                  <strong className="text-[color:var(--color-success-500)]">Full {sessionMinutes}m completed</strong>
                ) : elapsedSeconds >= 60 ? (
                  <span>Elapsed: ~{elapsedMinutes}m study time</span>
                ) : (
                  <span>Run timer to record focus minutes</span>
                )}
              </span>

              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                  Close
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={logFocusTime.isPending || (!hasFinished && elapsedSeconds < 60)}
                  onClick={handleSaveTimerSession}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {logFocusTime.isPending
                    ? 'Saving...'
                    : hasFinished
                      ? `Save ${sessionMinutes}m Focus`
                      : `Log ${elapsedMinutes}m Focus`}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Manual Quick Log Tab */
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-secondary">
                Quick Log Preset Durations
              </label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <Button
                    key={mins}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={logFocusTime.isPending}
                    onClick={() => handleSaveManualLog(mins)}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    {mins}m
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-default bg-surface-2/30 p-3.5 space-y-3">
              <label htmlFor="custom-minutes" className="block text-xs font-semibold text-primary">
                Custom Study Time
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="custom-minutes"
                  type="number"
                  min="1"
                  max="720"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  placeholder="Minutes"
                  className="w-32"
                />
                <span className="text-xs text-secondary">minutes studied offline</span>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={
                  logFocusTime.isPending ||
                  !manualMinutes ||
                  parseInt(manualMinutes, 10) <= 0 ||
                  isNaN(parseInt(manualMinutes, 10))
                }
                onClick={() => handleSaveManualLog(parseInt(manualMinutes, 10))}
                className="w-full gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                {logFocusTime.isPending ? 'Logging...' : `Log ${manualMinutes || 0} Minutes`}
              </Button>
            </div>

            <div className="flex justify-end border-t border-default pt-3">
              <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
