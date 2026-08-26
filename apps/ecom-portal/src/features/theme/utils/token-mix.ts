/** Blend a theme token color with transparent — no hardcoded hex/rgba. */
export function tokenMix(color: string, weightPercent: number): string {
  return `color-mix(in srgb, ${color} ${weightPercent}%, transparent)`;
}
