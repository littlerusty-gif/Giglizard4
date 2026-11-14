import React from "react";
import {
  PosterAspectRatio,
  PosterEmblemId,
  PosterFrameStyle,
  PosterLayoutId,
  PosterTextureId,
  PosterTypeId,
} from "../types";

export interface ThemePalette {
  bg: string;
  border: string;
  text: string;
  accent: string;
  sub: string;
  badgeBg: string;
  badgeBorder?: string;
  badgeText?: string;
}

export interface ThemeStylesResult {
  palette: ThemePalette;
  frameStyle: React.CSSProperties;
  taglineStyle: React.CSSProperties;
  bandNameStyle: React.CSSProperties;
  venueNameStyle: React.CSSProperties;
  dateBadgeStyle: React.CSSProperties;
  timeBadgeStyle: React.CSSProperties;
  graphicStyle: React.CSSProperties;
  sloganStyle: React.CSSProperties;
  supportingActsStyle: React.CSSProperties;

  frameClasses: string;
  taglineClasses: string;
  bandNameClasses: string;
  venueNameClasses: string;
  dateBadgeClasses: string;
  timeBadgeClasses: string;
  supportingActsClasses: string;
}

export interface PosterTypePreset {
  id: PosterTypeId;
  label: string;
  shortDesc: string;
  recommendedAspect: PosterAspectRatio;
  recommendedExport: "11x17" | "12x18" | "4.25x5.5" | "png";
}

export const POSTER_TYPE_PRESETS: PosterTypePreset[] = [
  {
    id: "single-show",
    label: "Single Show",
    shortDesc: "Classic club gig flyer with headliner, support, venue & ticket details",
    recommendedAspect: "2:3",
    recommendedExport: "11x17",
  },
  {
    id: "tour-dates",
    label: "Tour Poster",
    shortDesc: "Multi-city routing poster with stacked dates, cities & venues",
    recommendedAspect: "2:3",
    recommendedExport: "12x18",
  },
  {
    id: "album-release",
    label: "Album Release",
    shortDesc: "Record release night or vinyl/streaming drop promo card",
    recommendedAspect: "4:5",
    recommendedExport: "png",
  },
  {
    id: "festival-bill",
    label: "Festival / Showcase",
    shortDesc: "Multi-act showcase bill with event header & stacked lineup",
    recommendedAspect: "2:3",
    recommendedExport: "11x17",
  },
  {
    id: "social-promo",
    label: "Social Story / Feed",
    shortDesc: "High-impact 1:1 square or 9:16 vertical flyer for IG, TikTok & Bandsintown",
    recommendedAspect: "9:16",
    recommendedExport: "png",
  },
];

export const ASPECT_RATIO_OPTIONS: Array<{
  id: PosterAspectRatio;
  label: string;
  dims: string;
  ratioStyle: string;
  maxWidthPx: number;
}> = [
  { id: "2:3", label: "Poster (2:3)", dims: "11×17 / 12×18", ratioStyle: "2 / 3", maxWidthPx: 360 },
  { id: "4:5", label: "IG Feed (4:5)", dims: "1080×1350 px", ratioStyle: "4 / 5", maxWidthPx: 380 },
  { id: "1:1", label: "Square (1:1)", dims: "1080×1080 px", ratioStyle: "1 / 1", maxWidthPx: 400 },
  { id: "9:16", label: "Story / Reels (9:16)", dims: "1080×1920 px", ratioStyle: "9 / 16", maxWidthPx: 295 },
];

export const LAYOUT_OPTIONS: Array<{
  id: PosterLayoutId;
  label: string;
  desc: string;
}> = [
  { id: "centered", label: "Classic Center", desc: "Balanced symmetrical stage bill" },
  { id: "editorial-left", label: "Swiss Left", desc: "Clean left-aligned grid typography" },
  { id: "bold-stack", label: "Brutalist Stack", desc: "Full-width block bars & oversized title" },
  { id: "split-band", label: "Split Horizon", desc: "Top hero headline with ruled lower card" },
];

export const FRAME_STYLE_OPTIONS: Array<{
  id: PosterFrameStyle;
  label: string;
}> = [
  { id: "solid", label: "Crisp Border" },
  { id: "double", label: "Double Frame" },
  { id: "brutalist", label: "Heavy Thick" },
  { id: "dashed", label: "Ticket Dashed" },
  { id: "corners", label: "Crop Corners" },
  { id: "bleed", label: "Borderless" },
];

export const TEXTURE_OPTIONS: Array<{
  id: PosterTextureId;
  label: string;
}> = [
  { id: "none", label: "Clean Matte" },
  { id: "halftone", label: "Halftone Dots" },
  { id: "scanlines", label: "CRT Scanlines" },
  { id: "diagonal", label: "Riso Stripes" },
  { id: "grid", label: "Graph Grid" },
  { id: "radial", label: "Stage Spotlight" },
  { id: "grain", label: "Zine Paper" },
];

export const EMBLEM_OPTIONS: Array<{
  id: PosterEmblemId;
  label: string;
}> = [
  { id: "none", label: "None" },
  { id: "vinyl", label: "Vinyl" },
  { id: "lightning", label: "Bolt" },
  { id: "starburst", label: "Starburst" },
  { id: "waves", label: "Soundwave" },
  { id: "sun", label: "Synth Sun" },
  { id: "floral", label: "Botanical" },
  { id: "skull", label: "Skull" },
  { id: "guitar", label: "Pick" },
  { id: "crosshair", label: "Target" },
];

export const POSTER_THEMES = [
  { id: "heavy-grunge", label: "Grunge Flyer", swatch: "#7f1d1d" },
  { id: "classic-rock", label: "70s Classic Rock", swatch: "#d97706" },
  { id: "indie-minimal", label: "Indie Minimalist", swatch: "#10b981" },
  { id: "punk-diy", label: "Punk DIY Zine", swatch: "#facc15" },
  { id: "retro-neon", label: "Synthwave Neon", swatch: "#ec4899" },
  { id: "psychedelic-acid", label: "Psychedelic 60s", swatch: "#a855f7" },
  { id: "metal-hellfire", label: "Metal / Hardcore", swatch: "#ef4444" },
  { id: "folk-acoustic", label: "Organic Folk", swatch: "#92400e" },
  { id: "jazz-vanguard", label: "Jazz Midnight", swatch: "#f59e0b" },
  { id: "dubstep-laser", label: "Club / Electronic", swatch: "#06b6d4" },
  { id: "pop-bubblegum", label: "Pop Bright", swatch: "#db2777" },
  { id: "americana-western", label: "Americana Press", swatch: "#b45309" },
  { id: "hiphop-street", label: "Street Concrete", swatch: "#eab308" },
  { id: "shoegaze-dream", label: "Shoegaze Haze", swatch: "#818cf8" },
];

export const FONT_STYLES = [
  { id: "impact", label: "Anton Impact", sample: "MIDNIGHT", fontClass: "poster-font-anton uppercase tracking-tight" },
  { id: "bebas", label: "Bebas Condensed", sample: "HEADLINER", fontClass: "poster-font-bebas uppercase tracking-wide" },
  { id: "oswald", label: "Oswald Poster", sample: "LIVE TONIGHT", fontClass: "poster-font-oswald font-bold uppercase tracking-tight" },
  { id: "serif", label: "Fraunces Editorial", sample: "Vintage", fontClass: "poster-font-fraunces font-black tracking-tight" },
  { id: "syne", label: "Syne Avant-Garde", sample: "VANGUARD", fontClass: "poster-font-syne font-extrabold uppercase tracking-tighter" },
  { id: "clean", label: "Grotesk Clean", sample: "Minimalist", fontClass: "poster-font-grotesk font-bold tracking-tight" },
  { id: "distressed", label: "Zine Typewriter", sample: "DIY SHOW", fontClass: "poster-font-courier font-bold uppercase tracking-tight" },
  { id: "mono", label: "Tech Mono", sample: "SIGNAL_01", fontClass: "poster-font-mono font-extrabold uppercase tracking-tight" },
];

export const COLOR_SWATCHES = [
  { id: "default", label: "Theme Default", hex: "#94a3b8" },
  { id: "red", label: "Crimson Red", hex: "#dc2626" },
  { id: "blue", label: "Electric Cyan", hex: "#0284c7" },
  { id: "green", label: "Acid Emerald", hex: "#10b981" },
  { id: "purple", label: "Ultraviolet", hex: "#9333ea" },
  { id: "amber", label: "Solar Gold", hex: "#f59e0b" },
  { id: "pink", label: "Hot Magenta", hex: "#ec4899" },
  { id: "black", label: "Monochrome Ink", hex: "#18181b" },
];

export const getPosterFontClass = (fontStyle?: string): string => {
  const match = FONT_STYLES.find((f) => f.id === fontStyle);
  if (match) return match.fontClass;
  switch (fontStyle) {
    case "serif":
      return "poster-font-fraunces font-black tracking-tight";
    case "clean":
      return "poster-font-grotesk font-bold tracking-tight";
    case "mono":
      return "poster-font-mono font-extrabold uppercase tracking-tight";
    case "distressed":
      return "poster-font-courier font-bold uppercase tracking-tight";
    case "impact":
    default:
      return "poster-font-anton uppercase tracking-tight";
  }
};

const buildThemeStyle = (
  palette: ThemePalette,
  classes: {
    frameClasses?: string;
    taglineClasses?: string;
    bandNameClasses?: string;
    venueNameClasses?: string;
    dateBadgeClasses?: string;
    timeBadgeClasses?: string;
    supportingActsClasses?: string;
  } = {}
): ThemeStylesResult => {
  const frameClasses = classes.frameClasses || "font-sans tracking-tight";
  const taglineClasses = classes.taglineClasses || "tracking-widest";
  const bandNameClasses = classes.bandNameClasses || "uppercase font-black";
  const venueNameClasses = classes.venueNameClasses || "font-sans uppercase font-bold tracking-wide";
  const dateBadgeClasses = classes.dateBadgeClasses || "font-bold font-mono";
  const timeBadgeClasses = classes.timeBadgeClasses || "font-semibold";
  const supportingActsClasses = classes.supportingActsClasses || "font-mono font-bold";

  return {
    palette,
    frameStyle: {
      backgroundColor: palette.bg,
      borderColor: palette.border,
      color: palette.text,
    },
    taglineStyle: { color: palette.accent },
    bandNameStyle: { color: palette.text },
    venueNameStyle: { color: palette.sub },
    dateBadgeStyle: {
      backgroundColor: palette.badgeBg,
      borderColor: palette.badgeBorder || palette.border,
      color: palette.badgeText || palette.text,
    },
    timeBadgeStyle: {
      backgroundColor: palette.badgeBg,
      borderColor: palette.badgeBorder || palette.border,
      color: palette.sub,
    },
    graphicStyle: { color: palette.accent },
    sloganStyle: { color: palette.accent },
    supportingActsStyle: {
      backgroundColor: palette.badgeBg,
      borderColor: palette.border,
      color: palette.accent,
    },
    frameClasses,
    taglineClasses,
    bandNameClasses,
    venueNameClasses,
    dateBadgeClasses,
    timeBadgeClasses,
    supportingActsClasses,
  };
};

export const getThemeClasses = (
  themeId: string,
  colorId: string = "default",
  customColors?: { bg?: string; text?: string; accent?: string }
): ThemeStylesResult => {
  const palettesByTheme: Record<string, Record<string, ThemePalette>> = {
    "heavy-grunge": {
      default: { bg: "#1a0505", border: "#7f1d1d", text: "#fee2e2", accent: "#f97316", sub: "#fca5a5", badgeBg: "#2d0a0a" },
      red:     { bg: "#1a0505", border: "#7f1d1d", text: "#fee2e2", accent: "#ef4444", sub: "#fca5a5", badgeBg: "#2d0a0a" },
      blue:    { bg: "#030f24", border: "#0369a1", text: "#e0f2fe", accent: "#38bdf8", sub: "#7dd3fc", badgeBg: "#072147" },
      green:   { bg: "#021a0d", border: "#047857", text: "#d1fae5", accent: "#10b981", sub: "#6ee7b7", badgeBg: "#04361c" },
      purple:  { bg: "#180824", border: "#6b21a8", text: "#f3e8ff", accent: "#a855f7", sub: "#d8b4fe", badgeBg: "#2c0f42" },
      amber:   { bg: "#1c1103", border: "#b45309", text: "#fef3c7", accent: "#f59e0b", sub: "#fcd34d", badgeBg: "#382206" },
      pink:    { bg: "#210414", border: "#be185d", text: "#fce7f3", accent: "#ec4899", sub: "#f472b6", badgeBg: "#420928" },
      black:   { bg: "#0a0a0a", border: "#3f3f46", text: "#ffffff", accent: "#d4d4d8", sub: "#e4e4e7", badgeBg: "#18181b" },
    },
    "classic-rock": {
      default: { bg: "#14100c", border: "#d97706", text: "#fef3c7", accent: "#f59e0b", sub: "#fde68a", badgeBg: "#291807" },
      red:     { bg: "#1a0a0a", border: "#b91c1c", text: "#fee2e2", accent: "#ef4444", sub: "#fca5a5", badgeBg: "#2d0f0f" },
      blue:    { bg: "#0a121a", border: "#0369a1", text: "#e0f2fe", accent: "#0ea5e9", sub: "#7dd3fc", badgeBg: "#0f1f2d" },
      green:   { bg: "#0a180e", border: "#047857", text: "#d1fae5", accent: "#10b981", sub: "#6ee7b7", badgeBg: "#0e2a18" },
      purple:  { bg: "#160a1f", border: "#6b21a8", text: "#f3e8ff", accent: "#a855f7", sub: "#d8b4fe", badgeBg: "#271237" },
      amber:   { bg: "#1c1208", border: "#d97706", text: "#fef3c7", accent: "#f59e0b", sub: "#fde68a", badgeBg: "#331e0b" },
      pink:    { bg: "#1f0a17", border: "#be185d", text: "#fce7f3", accent: "#ec4899", sub: "#f472b6", badgeBg: "#381229" },
      black:   { bg: "#0d0d0d", border: "#3f3f46", text: "#f4f4f5", accent: "#a1a1aa", sub: "#e4e4e7", badgeBg: "#18181b" },
    },
    "retro-neon": {
      default: { bg: "#090414", border: "#ec4899", text: "#ffffff", accent: "#38bdf8", sub: "#f43f5e", badgeBg: "#15072e" },
      red:     { bg: "#0d0408", border: "#ef4444", text: "#ffffff", accent: "#f97316", sub: "#ef4444", badgeBg: "#210812" },
      blue:    { bg: "#030c1c", border: "#06b6d4", text: "#ffffff", accent: "#38bdf8", sub: "#06b6d4", badgeBg: "#071936" },
      green:   { bg: "#02140d", border: "#10b981", text: "#ffffff", accent: "#34d399", sub: "#10b981", badgeBg: "#052618" },
      purple:  { bg: "#180824", border: "#a855f7", text: "#ffffff", accent: "#e879f9", sub: "#c084fc", badgeBg: "#280e3d" },
      amber:   { bg: "#140c03", border: "#f59e0b", text: "#ffffff", accent: "#fde047", sub: "#f59e0b", badgeBg: "#2a1705" },
      pink:    { bg: "#170312", border: "#ec4899", text: "#ffffff", accent: "#f472b6", sub: "#ec4899", badgeBg: "#300726" },
      black:   { bg: "#09090b", border: "#71717a", text: "#ffffff", accent: "#d4d4d8", sub: "#a1a1aa", badgeBg: "#18181b" },
    },
    "indie-minimal": {
      default: { bg: "#ffffff", border: "#e4e4e7", text: "#111827", accent: "#10b981", sub: "#52525b", badgeBg: "#f4f4f5" },
      red:     { bg: "#fef2f2", border: "#fecaca", text: "#7f1d1d", accent: "#b91c1c", sub: "#991b1b", badgeBg: "#fee2e2" },
      blue:    { bg: "#f0f9ff", border: "#bae6fd", text: "#0c4a6e", accent: "#0284c7", sub: "#0369a1", badgeBg: "#e0f2fe" },
      green:   { bg: "#f0fdf4", border: "#bbf7d0", text: "#064e3b", accent: "#059669", sub: "#047857", badgeBg: "#dcfce7" },
      purple:  { bg: "#faf5ff", border: "#e9d5ff", text: "#581c87", accent: "#7c3aed", sub: "#6b21a8", badgeBg: "#f3e8ff" },
      amber:   { bg: "#fffbeb", border: "#fde68a", text: "#78350f", accent: "#d97706", sub: "#b45309", badgeBg: "#fef3c7" },
      pink:    { bg: "#fdf2f8", border: "#fbcfe8", text: "#831843", accent: "#db2777", sub: "#be185d", badgeBg: "#fce7f3" },
      black:   { bg: "#fafafa", border: "#d4d4d8", text: "#18181b", accent: "#3f3f46", sub: "#52525b", badgeBg: "#f4f4f5" },
    },
    "folk-acoustic": {
      default: { bg: "#fdfaf2", border: "#78350f", text: "#451a03", accent: "#92400e", sub: "#78350f", badgeBg: "#fef3c7" },
      red:     { bg: "#fff5f5", border: "#991b1b", text: "#450a0a", accent: "#b91c1c", sub: "#991b1b", badgeBg: "#fee2e2" },
      blue:    { bg: "#f0f9ff", border: "#075985", text: "#082f49", accent: "#0369a1", sub: "#0284c7", badgeBg: "#e0f2fe" },
      green:   { bg: "#f0fdf4", border: "#065f46", text: "#022c22", accent: "#047857", sub: "#059669", badgeBg: "#dcfce7" },
      purple:  { bg: "#faf5ff", border: "#6b21a8", text: "#3b0764", accent: "#7e22ce", sub: "#6b21a8", badgeBg: "#f3e8ff" },
      amber:   { bg: "#fffaf0", border: "#92400e", text: "#451a03", accent: "#b45309", sub: "#78350f", badgeBg: "#fef3c7" },
      pink:    { bg: "#fff5f7", border: "#9d174d", text: "#500724", accent: "#be185d", sub: "#831843", badgeBg: "#fce7f3" },
      black:   { bg: "#f4f4f5", border: "#27272a", text: "#09090b", accent: "#3f3f46", sub: "#52525b", badgeBg: "#e4e4e7" },
    },
    "psychedelic-acid": {
      default: { bg: "#180824", border: "#86198f", text: "#fde047", accent: "#facc15", sub: "#d8b4fe", badgeBg: "#2c0f42" },
      red:     { bg: "#250808", border: "#991b1b", text: "#fca5a5", accent: "#f87171", sub: "#fecaca", badgeBg: "#381010" },
      blue:    { bg: "#02182c", border: "#0369a1", text: "#7dd3fc", accent: "#22d3ee", sub: "#bae6fd", badgeBg: "#05284a" },
      green:   { bg: "#042416", border: "#047857", text: "#6ee7b7", accent: "#10b981", sub: "#a7f3d0", badgeBg: "#093823" },
      purple:  { bg: "#180824", border: "#7e22ce", text: "#f0abfc", accent: "#c084fc", sub: "#f5d0fe", badgeBg: "#2c0f42" },
      amber:   { bg: "#221002", border: "#b45309", text: "#fde047", accent: "#f59e0b", sub: "#fef08a", badgeBg: "#3b1c04" },
      pink:    { bg: "#250012", border: "#be185d", text: "#f9a8d4", accent: "#ec4899", sub: "#fbcfe8", badgeBg: "#420422" },
      black:   { bg: "#0a0a0a", border: "#3f3f46", text: "#e4e4e7", accent: "#a1a1aa", sub: "#d4d4d8", badgeBg: "#18181b" },
    },
    "metal-hellfire": {
      default: { bg: "#090504", border: "#7f1d1d", text: "#ffffff", accent: "#ef4444", sub: "#fca5a5", badgeBg: "#1f0a0a" },
      red:     { bg: "#090504", border: "#7f1d1d", text: "#ffffff", accent: "#ef4444", sub: "#fca5a5", badgeBg: "#1f0a0a" },
      blue:    { bg: "#030914", border: "#0c4a6e", text: "#ffffff", accent: "#38bdf8", sub: "#7dd3fc", badgeBg: "#061a33" },
      green:   { bg: "#021208", border: "#064e3b", text: "#ffffff", accent: "#34d399", sub: "#6ee7b7", badgeBg: "#042610" },
      purple:  { bg: "#0d0317", border: "#581c87", text: "#ffffff", accent: "#c084fc", sub: "#d8b4fe", badgeBg: "#1e0833" },
      amber:   { bg: "#120902", border: "#78350f", text: "#ffffff", accent: "#fbbf24", sub: "#fde68a", badgeBg: "#291506" },
      pink:    { bg: "#14020d", border: "#831843", text: "#ffffff", accent: "#f472b6", sub: "#f9a8d4", badgeBg: "#2d061f" },
      black:   { bg: "#050505", border: "#27272a", text: "#ffffff", accent: "#a1a1aa", sub: "#d4d4d8", badgeBg: "#18181b" },
    },
    "pop-bubblegum": {
      default: { bg: "#fdf2f8", border: "#f472b6", text: "#9d174d", accent: "#db2777", sub: "#be185d", badgeBg: "#fbcfe8" },
      red:     { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", accent: "#dc2626", sub: "#b91c1c", badgeBg: "#fee2e2" },
      blue:    { bg: "#f0f9ff", border: "#7dd3fc", text: "#075985", accent: "#0284c7", sub: "#0369a1", badgeBg: "#e0f2fe" },
      green:   { bg: "#f0fdf4", border: "#86efac", text: "#065f46", accent: "#059669", sub: "#047857", badgeBg: "#dcfce7" },
      purple:  { bg: "#faf5ff", border: "#d8b4fe", text: "#6b21a8", accent: "#7c3aed", sub: "#7e22ce", badgeBg: "#f3e8ff" },
      amber:   { bg: "#fffbeb", border: "#fcd34d", text: "#92400e", accent: "#d97706", sub: "#b45309", badgeBg: "#fef3c7" },
      pink:    { bg: "#fdf2f8", border: "#f472b6", text: "#9d174d", accent: "#db2777", sub: "#be185d", badgeBg: "#fbcfe8" },
      black:   { bg: "#fafafa", border: "#d4d4d8", text: "#18181b", accent: "#3f3f46", sub: "#52525b", badgeBg: "#f4f4f5" },
    },
    "jazz-vanguard": {
      default: { bg: "#020617", border: "#78350f", text: "#fef3c7", accent: "#f59e0b", sub: "#fbbf24", badgeBg: "#1c1208" },
      red:     { bg: "#0b0202", border: "#7f1d1d", text: "#fee2e2", accent: "#ef4444", sub: "#fca5a5", badgeBg: "#1e0808" },
      blue:    { bg: "#010b14", border: "#0c4a6e", text: "#e0f2fe", accent: "#38bdf8", sub: "#7dd3fc", badgeBg: "#061b2e" },
      green:   { bg: "#020c08", border: "#064e3b", text: "#d1fae5", accent: "#34d399", sub: "#6ee7b7", badgeBg: "#041f12" },
      purple:  { bg: "#0a020f", border: "#581c87", text: "#f3e8ff", accent: "#c084fc", sub: "#d8b4fe", badgeBg: "#1a0526" },
      amber:   { bg: "#0e0701", border: "#78350f", text: "#fef3c7", accent: "#f59e0b", sub: "#fbbf24", badgeBg: "#241103" },
      pink:    { bg: "#0e0108", border: "#831843", text: "#fce7f3", accent: "#f472b6", sub: "#f9a8d4", badgeBg: "#240416" },
      black:   { bg: "#030303", border: "#27272a", text: "#f4f4f5", accent: "#a1a1aa", sub: "#d4d4d8", badgeBg: "#18181b" },
    },
    "dubstep-laser": {
      default: { bg: "#000000", border: "#10b981", text: "#ecfdf5", accent: "#34d399", sub: "#6ee7b7", badgeBg: "#052618" },
      red:     { bg: "#000000", border: "#ef4444", text: "#fef2f2", accent: "#f87171", sub: "#fca5a5", badgeBg: "#2d0a0a" },
      blue:    { bg: "#000000", border: "#06b6d4", text: "#ecfeff", accent: "#22d3ee", sub: "#67e8f9", badgeBg: "#072147" },
      green:   { bg: "#000000", border: "#10b981", text: "#ecfdf5", accent: "#34d399", sub: "#6ee7b7", badgeBg: "#052618" },
      purple:  { bg: "#000000", border: "#a855f7", text: "#faf5ff", accent: "#c084fc", sub: "#d8b4fe", badgeBg: "#280e3d" },
      amber:   { bg: "#000000", border: "#f59e0b", text: "#fffbeb", accent: "#fbbf24", sub: "#fde68a", badgeBg: "#2a1705" },
      pink:    { bg: "#000000", border: "#ec4899", text: "#fdf2f8", accent: "#f472b6", sub: "#f9a8d4", badgeBg: "#300726" },
      black:   { bg: "#000000", border: "#52525b", text: "#f4f4f5", accent: "#a1a1aa", sub: "#d4d4d8", badgeBg: "#18181b" },
    },
    "americana-western": {
      default: { bg: "#f5efe6", border: "#7c2d12", text: "#29180c", accent: "#b45309", sub: "#78350f", badgeBg: "#e7dccb" },
      red:     { bg: "#f7ece8", border: "#7f1d1d", text: "#3b0a0a", accent: "#b91c1c", sub: "#7f1d1d", badgeBg: "#ecd5cf" },
      blue:    { bg: "#eef3f7", border: "#1e3a5f", text: "#0f243d", accent: "#1d4ed8", sub: "#1e40af", badgeBg: "#dbe6f0" },
      green:   { bg: "#eff5ef", border: "#14532d", text: "#052e16", accent: "#15803d", sub: "#166534", badgeBg: "#d8ead8" },
      purple:  { bg: "#f4eff7", border: "#581c87", text: "#2e1065", accent: "#7e22ce", sub: "#6b21a8", badgeBg: "#e6dcf0" },
      amber:   { bg: "#f9f1e2", border: "#92400e", text: "#451a03", accent: "#d97706", sub: "#92400e", badgeBg: "#f1dfc1" },
      pink:    { bg: "#f7eef2", border: "#831843", text: "#500724", accent: "#be185d", sub: "#9d174d", badgeBg: "#edd7e1" },
      black:   { bg: "#eceae4", border: "#1c1917", text: "#1c1917", accent: "#44403c", sub: "#57534e", badgeBg: "#dcd8cf" },
    },
    "hiphop-street": {
      default: { bg: "#111827", border: "#eab308", text: "#ffffff", accent: "#facc15", sub: "#cbd5e1", badgeBg: "#1f2937" },
      red:     { bg: "#111111", border: "#ef4444", text: "#ffffff", accent: "#ef4444", sub: "#e5e5e5", badgeBg: "#262626" },
      blue:    { bg: "#0f172a", border: "#38bdf8", text: "#ffffff", accent: "#38bdf8", sub: "#cbd5e1", badgeBg: "#1e293b" },
      green:   { bg: "#0f1713", border: "#22c55e", text: "#ffffff", accent: "#4ade80", sub: "#d1d5db", badgeBg: "#1c2a22" },
      purple:  { bg: "#141022", border: "#a855f7", text: "#ffffff", accent: "#c084fc", sub: "#d8b4fe", badgeBg: "#251c3d" },
      amber:   { bg: "#14120c", border: "#f59e0b", text: "#ffffff", accent: "#fbbf24", sub: "#fde68a", badgeBg: "#262115" },
      pink:    { bg: "#170e14", border: "#ec4899", text: "#ffffff", accent: "#f472b6", sub: "#fbcfe8", badgeBg: "#2c1925" },
      black:   { bg: "#09090b", border: "#52525b", text: "#ffffff", accent: "#a1a1aa", sub: "#d4d4d8", badgeBg: "#18181b" },
    },
    "shoegaze-dream": {
      default: { bg: "#1e1b4b", border: "#818cf8", text: "#eef2ff", accent: "#f472b6", sub: "#c7d2fe", badgeBg: "#312e81" },
      red:     { bg: "#2c1020", border: "#fb7185", text: "#fff1f2", accent: "#fda4af", sub: "#fecdd3", badgeBg: "#4c1d34" },
      blue:    { bg: "#0f172a", border: "#60a5fa", text: "#eff6ff", accent: "#93c5fd", sub: "#bfdbfe", badgeBg: "#1e3a8a" },
      green:   { bg: "#0f2424", border: "#2dd4bf", text: "#f0fdfa", accent: "#5eead4", sub: "#99f6e4", badgeBg: "#134e4a" },
      purple:  { bg: "#2e1065", border: "#c084fc", text: "#faf5ff", accent: "#e879f9", sub: "#e9d5ff", badgeBg: "#4c1d95" },
      amber:   { bg: "#271c19", border: "#fbbf24", text: "#fffbeb", accent: "#fde68a", sub: "#fef3c7", badgeBg: "#451a03" },
      pink:    { bg: "#3b0764", border: "#f472b6", text: "#fdf2f8", accent: "#f9a8d4", sub: "#fbcfe8", badgeBg: "#500724" },
      black:   { bg: "#18181b", border: "#71717a", text: "#f4f4f5", accent: "#d4d4d8", sub: "#a1a1aa", badgeBg: "#27272a" },
    },
  };

  let palette: ThemePalette;

  if (themeId === "punk-diy") {
    const punkMap: Record<string, ThemePalette> = {
      default: { bg: "#ffffff", border: "#000000", text: "#000000", accent: "#facc15", sub: "#000000", badgeBg: "#facc15" },
      red:     { bg: "#fee2e2", border: "#000000", text: "#000000", accent: "#ef4444", sub: "#000000", badgeBg: "#f87171" },
      blue:    { bg: "#e0f2fe", border: "#000000", text: "#000000", accent: "#38bdf8", sub: "#000000", badgeBg: "#7dd3fc" },
      green:   { bg: "#dcfce7", border: "#000000", text: "#000000", accent: "#4ade80", sub: "#000000", badgeBg: "#86efac" },
      purple:  { bg: "#f3e8ff", border: "#000000", text: "#000000", accent: "#c084fc", sub: "#000000", badgeBg: "#d8b4fe" },
      amber:   { bg: "#fef3c7", border: "#000000", text: "#000000", accent: "#fbbf24", sub: "#000000", badgeBg: "#fde68a" },
      pink:    { bg: "#fce7f3", border: "#000000", text: "#000000", accent: "#f472b6", sub: "#000000", badgeBg: "#f9a8d4" },
      black:   { bg: "#e4e4e7", border: "#000000", text: "#000000", accent: "#d4d4d8", sub: "#000000", badgeBg: "#ffffff" },
    };
    const p = { ...(punkMap[colorId] || punkMap.default) };
    if (customColors?.bg) p.bg = customColors.bg;
    if (customColors?.text) p.text = customColors.text;
    if (customColors?.accent) {
      p.accent = customColors.accent;
      p.badgeBg = customColors.accent;
    }

    return {
      palette: p,
      frameStyle: { backgroundColor: p.bg, borderColor: "#000000", color: p.text },
      taglineStyle: { backgroundColor: p.accent, color: "#000000" },
      bandNameStyle: { backgroundColor: "#000000", color: "#ffffff" },
      venueNameStyle: { backgroundColor: "#ffffff", color: "#000000", borderColor: "#000000" },
      dateBadgeStyle: { backgroundColor: p.badgeBg, borderColor: "#000000", color: "#000000" },
      timeBadgeStyle: { backgroundColor: "#000000", color: "#ffffff" },
      graphicStyle: { color: "#000000" },
      sloganStyle: { color: "#000000" },
      supportingActsStyle: { backgroundColor: "#000000", color: p.accent, borderColor: "#000000" },
      frameClasses: "font-mono",
      taglineClasses: "font-black px-2 py-0.5 tracking-tighter uppercase",
      bandNameClasses: "px-2 py-1 font-black",
      venueNameClasses: "border-2 inline-block px-2 py-0.5 font-bold uppercase",
      dateBadgeClasses: "border-2 font-black",
      timeBadgeClasses: "px-2 py-0.5 rounded-none font-black",
      supportingActsClasses: "font-mono font-black border-2",
    };
  }

  const themeTable = palettesByTheme[themeId] || palettesByTheme["heavy-grunge"];
  palette = { ...(themeTable[colorId] || themeTable.default) };

  if (customColors?.bg) palette.bg = customColors.bg;
  if (customColors?.text) {
    palette.text = customColors.text;
    palette.sub = customColors.text;
  }
  if (customColors?.accent) {
    palette.accent = customColors.accent;
    palette.border = customColors.accent;
  }

  return buildThemeStyle(palette, {
    frameClasses:
      themeId === "classic-rock" || themeId === "folk-acoustic" || themeId === "jazz-vanguard" || themeId === "americana-western"
        ? "font-serif"
        : themeId === "dubstep-laser" || themeId === "retro-neon"
        ? "font-mono"
        : "font-sans",
    taglineClasses: "uppercase font-bold tracking-widest",
    bandNameClasses: "font-black tracking-tight",
    venueNameClasses: "uppercase font-bold tracking-wide",
    dateBadgeClasses: "font-mono font-bold border",
    timeBadgeClasses: "border",
    supportingActsClasses: "font-mono font-bold border",
  });
};

export const getTextureStyle = (textureId: PosterTextureId | undefined, accentHex: string): React.CSSProperties => {
  switch (textureId) {
    case "halftone":
      return {
        backgroundImage: `radial-gradient(${accentHex}33 1.5px, transparent 1.5px)`,
        backgroundSize: "10px 10px",
      };
    case "scanlines":
      return {
        backgroundImage: `repeating-linear-gradient(0deg, ${accentHex}18 0px, ${accentHex}18 1px, transparent 1px, transparent 5px)`,
      };
    case "diagonal":
      return {
        backgroundImage: `repeating-linear-gradient(-45deg, ${accentHex}14 0px, ${accentHex}14 6px, transparent 6px, transparent 18px)`,
      };
    case "grid":
      return {
        backgroundImage: `linear-gradient(${accentHex}20 1px, transparent 1px), linear-gradient(90deg, ${accentHex}20 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      };
    case "radial":
      return {
        backgroundImage: `radial-gradient(circle at 50% 38%, ${accentHex}38 0%, transparent 68%)`,
      };
    case "grain":
      return {
        backgroundImage: `radial-gradient(${accentHex}22 1px, transparent 0), radial-gradient(${accentHex}14 1px, transparent 0)`,
        backgroundSize: "14px 14px",
        backgroundPosition: "0 0, 7px 7px",
      };
    case "none":
    default:
      return {};
  }
};

export const renderPosterEmblemSvg = (emblemId: PosterEmblemId | undefined, color: string): React.ReactNode => {
  if (!emblemId || emblemId === "none") return null;

  switch (emblemId) {
    case "vinyl":
      return (
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="2.5" />
          <circle cx="24" cy="24" r="14" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="24" cy="24" r="6" fill={color} />
          <circle cx="24" cy="24" r="2" fill="#000000" />
        </svg>
      );
    case "lightning":
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={`${color}33`} />
        </svg>
      );
    case "starburst":
      return (
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path
            d="M24 2L28.5 16.5L43 13L32.5 24L43 35L28.5 31.5L24 46L19.5 31.5L5 35L15.5 24L5 13L19.5 16.5L24 2Z"
            stroke={color}
            strokeWidth="2"
            fill={`${color}26`}
          />
        </svg>
      );
    case "waves":
      return (
        <svg width="88" height="28" viewBox="0 0 88 28" fill="none" aria-hidden="true">
          {[4, 11, 18, 25, 32, 39, 46, 53, 60, 67, 74, 81].map((x, idx) => {
            const heights = [6, 14, 22, 10, 24, 16, 24, 12, 20, 14, 8, 6];
            const h = heights[idx];
            const y = (28 - h) / 2;
            return <rect key={x} x={x} y={y} width="3.5" height={h} rx="1.75" fill={color} />;
          })}
        </svg>
      );
    case "sun":
      return (
        <svg width="56" height="36" viewBox="0 0 56 36" fill="none" aria-hidden="true">
          <path d="M8 28C8 16.954 16.954 8 28 8C39.046 8 48 16.954 48 28H8Z" fill={`${color}33`} stroke={color} strokeWidth="2" />
          <line x1="2" y1="32" x2="54" y2="32" stroke={color} strokeWidth="2" />
          <line x1="12" y1="22" x2="44" y2="22" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case "floral":
      return (
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="14" r="6" stroke={color} strokeWidth="2" />
          <circle cx="34" cy="24" r="6" stroke={color} strokeWidth="2" />
          <circle cx="24" cy="34" r="6" stroke={color} strokeWidth="2" />
          <circle cx="14" cy="24" r="6" stroke={color} strokeWidth="2" />
          <circle cx="24" cy="24" r="4" fill={color} />
        </svg>
      );
    case "skull":
      return (
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path
            d="M24 6C14.5 6 8 12.5 8 21C8 26.5 11 31 15 33.5V40H33V33.5C37 31 40 26.5 40 21C40 12.5 33.5 6 24 6Z"
            stroke={color}
            strokeWidth="2.2"
            fill={`${color}18`}
          />
          <circle cx="18" cy="22" r="3.2" fill={color} />
          <circle cx="30" cy="22" r="3.2" fill={color} />
          <path d="M24 27L22 31H26L24 27Z" fill={color} />
          <line x1="19" y1="36" x2="19" y2="40" stroke={color} strokeWidth="2" />
          <line x1="24" y1="36" x2="24" y2="40" stroke={color} strokeWidth="2" />
          <line x1="29" y1="36" x2="29" y2="40" stroke={color} strokeWidth="2" />
        </svg>
      );
    case "guitar":
      return (
        <svg width="40" height="42" viewBox="0 0 44 48" fill="none" aria-hidden="true">
          <path
            d="M22 4C11 4 6 10 6 19C6 31 16 44 22 44C28 44 38 31 38 19C38 10 33 4 22 4Z"
            stroke={color}
            strokeWidth="2.5"
            fill={`${color}22`}
          />
          <path d="M16 18L28 18M22 12L22 28" stroke={color} strokeWidth="2" />
        </svg>
      );
    case "crosshair":
      return (
        <svg width="42" height="42" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="15" stroke={color} strokeWidth="2" />
          <circle cx="24" cy="24" r="6" stroke={color} strokeWidth="1.5" />
          <line x1="24" y1="3" x2="24" y2="45" stroke={color} strokeWidth="2" />
          <line x1="3" y1="24" x2="45" y2="24" stroke={color} strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
};

// Deterministic compact QR-style ticket stamp matrix (no external requests, crisp SVG in exports)
export const renderTicketQrStampSvg = (seedText: string, fgColor: string, bgColor: string): React.ReactNode => {
  const size = 9;
  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const cells: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inTopLeft = x < 3 && y < 3;
      const inTopRight = x >= size - 3 && y < 3;
      const inBottomLeft = x < 3 && y >= size - 3;
      if (inTopLeft || inTopRight || inBottomLeft) {
        const isBorder =
          (inTopLeft && (x === 0 || x === 2 || y === 0 || y === 2)) ||
          (inTopRight && (x === size - 3 || x === size - 1 || y === 0 || y === 2)) ||
          (inBottomLeft && (x === 0 || x === 2 || y === size - 3 || y === size - 1));
        const isCenter =
          (x === 1 && y === 1) ||
          (x === size - 2 && y === 1) ||
          (x === 1 && y === size - 2);
        if (isBorder || isCenter) cells.push({ x, y });
      } else {
        const bit = ((hash >>> ((x * 7 + y * 13) % 24)) ^ (x + y)) & 1;
        if (bit === 1) cells.push({ x, y });
      }
    }
  }
  return (
    <svg width="36" height="36" viewBox={`0 0 ${size} ${size}`} style={{ backgroundColor: bgColor }} aria-hidden="true">
      {cells.map((c, idx) => (
        <rect key={idx} x={c.x} y={c.y} width="0.88" height="0.88" fill={fgColor} />
      ))}
    </svg>
  );
};
