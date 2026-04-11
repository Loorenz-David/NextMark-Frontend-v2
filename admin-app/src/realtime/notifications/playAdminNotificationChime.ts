let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;

  const AudioContextConstructor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextConstructor();
  }

  return audioContext;
};

export const playAdminNotificationChime = async () => {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      return;
    }
  }

  const now = context.currentTime;
  const masterGain = context.createGain();
  masterGain.gain.setValueAtTime(0.0001, now);
  masterGain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
  masterGain.connect(context.destination);

  const buildTone = (
    frequency: number,
    startAt: number,
    duration: number,
    gainValue: number,
  ) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(gainValue, startAt + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      startAt + duration,
    );

    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.04);
  };

  buildTone(880, now, 0.18, 1);
  buildTone(1320, now + 0.11, 0.22, 0.85);
};

export const primeAdminNotificationAudio = async () => {
  const context = getAudioContext();
  if (!context) return false;

  if ((context.state as string) === "running") {
    return true;
  }

  try {
    await context.resume();
    return (context.state as string) === "running";
  } catch {
    return false;
  }
};
