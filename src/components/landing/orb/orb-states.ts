/**
 * Aturseva Living State Orb — state machine.
 *
 * The orb is the physical presence of the AI companion on the landing.
 * It is always alive; sections and interactions modulate it between
 * five named states. All values are artistic targets that the canvas
 * damps toward, so state changes read as mood changes, not cuts.
 */

export type OrbStateId = "idle" | "attentive" | "speaking" | "vigilant" | "night";

export interface OrbStateConfig {
  id: OrbStateId;
  /** Chip label shown under the orb. */
  label: string;
  /** One line of meaning, used in tooltips/section legends. */
  caption: string;
  /** Vertex-noise displacement amplitude. */
  noiseAmp: number;
  /** Vertex-noise spatial frequency. */
  noiseFreq: number;
  /** Rotation speed (rad/s). */
  speed: number;
  /** Breathing rate (Hz-ish multiplier on uTime). */
  breatheRate: number;
  /** Breathing depth (scale delta). */
  breatheDepth: number;
  /** Fresnel rim intensity 0–1. */
  rim: number;
  /** Core luminance 0–1. */
  core: number;
  /** Fresnel power — higher = tighter rim. */
  fresnelPower: number;
  /** CSS glow opacity behind the canvas. */
  glow: number;
}

export const ORB_STATES: Record<OrbStateId, OrbStateConfig> = {
  idle: {
    id: "idle",
    label: "breathing",
    caption: "At rest. Always on.",
    noiseAmp: 0.085,
    noiseFreq: 0.9,
    speed: 0.12,
    breatheRate: 0.55,
    breatheDepth: 0.03,
    rim: 0.5,
    core: 0.58,
    fresnelPower: 2.6,
    glow: 0.5,
  },
  attentive: {
    id: "attentive",
    label: "attentive",
    caption: "You're near. She notices.",
    noiseAmp: 0.15,
    noiseFreq: 1.5,
    speed: 0.28,
    breatheRate: 0.9,
    breatheDepth: 0.045,
    rim: 0.78,
    core: 0.68,
    fresnelPower: 2.1,
    glow: 0.7,
  },
  speaking: {
    id: "speaking",
    label: "speaking",
    caption: "Reminding. Out loud.",
    noiseAmp: 0.2,
    noiseFreq: 2.1,
    speed: 0.34,
    breatheRate: 1.5,
    breatheDepth: 0.055,
    rim: 0.92,
    core: 0.82,
    fresnelPower: 1.7,
    glow: 0.9,
  },
  vigilant: {
    id: "vigilant",
    label: "vigilant",
    caption: "Watching what matters.",
    noiseAmp: 0.11,
    noiseFreq: 2.5,
    speed: 0.46,
    breatheRate: 0.7,
    breatheDepth: 0.025,
    rim: 1.0,
    core: 0.46,
    fresnelPower: 3.2,
    glow: 0.62,
  },
  night: {
    id: "night",
    label: "night mode",
    caption: "Quiet hours. Still here.",
    noiseAmp: 0.06,
    noiseFreq: 0.55,
    speed: 0.05,
    breatheRate: 0.28,
    breatheDepth: 0.04,
    rim: 0.26,
    core: 0.3,
    fresnelPower: 3.0,
    glow: 0.28,
  },
};

export const ORB_STATE_ORDER: OrbStateId[] = [
  "idle",
  "attentive",
  "speaking",
  "vigilant",
  "night",
];
