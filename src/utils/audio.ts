// Web Audio API synthesizers for instant tactile audio feedback without external assets

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playAttendanceSound(
  status: 'present' | 'absent' | 'leave',
  soundEnabled: boolean = true
) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (status === 'present') {
      // Pleasant bright ding (587Hz D5 -> 880Hz A5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.start(now);
      osc.stop(now + 0.19);
    } else if (status === 'absent') {
      // Gentle soft tone for absent (330Hz -> 240Hz)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.14);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.start(now);
      osc.stop(now + 0.17);
    } else {
      // Leave / neutral tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.start(now);
      osc.stop(now + 0.16);
    }

    // Trigger subtle haptic feedback on mobile if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (status === 'present') {
        navigator.vibrate?.(25);
      } else if (status === 'absent') {
        navigator.vibrate?.([30, 40, 30]);
      } else {
        navigator.vibrate?.(20);
      }
    }
  } catch {
    // Ignore audio autoplay restrictions
  }
}
