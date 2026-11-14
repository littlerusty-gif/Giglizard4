import React, { useState, useEffect, useRef } from "react";
import {
  PosterConfig,
  PosterTypeId,
  PosterAspectRatio,
  PosterTourDate,
  SloganProposal,
  UserAccount,
} from "../types";
import {
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  Check,
  Download,
  Printer,
  Users,
  Save,
  Type,
  Palette,
  FileText,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertCircle,
  LayoutTemplate,
  SlidersHorizontal,
  Shuffle,
  RotateCcw,
  Upload,
  Trash2,
  Plus,
  Calendar,
  MapPin,
  Wine,
  UtensilsCrossed,
  QrCode,
  Scissors,
  Wand2,
  Layers,
} from "lucide-react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import PosterDesignerSeoGuide from "./PosterDesignerSeoGuide";
import {
  ASPECT_RATIO_OPTIONS,
  COLOR_SWATCHES,
  EMBLEM_OPTIONS,
  FONT_STYLES,
  FRAME_STYLE_OPTIONS,
  LAYOUT_OPTIONS,
  POSTER_THEMES,
  POSTER_TYPE_PRESETS,
  TEXTURE_OPTIONS,
  getPosterFontClass,
  getTextureStyle,
  getThemeClasses,
  renderPosterEmblemSvg,
  renderTicketQrStampSvg,
} from "./posterThemes";

interface PosterDesignerProps {
  config: PosterConfig;
  onChangeConfig: (config: PosterConfig) => void;
  currentUser?: any;
  currentAccount?: UserAccount | null;
}

type WorkbenchTab = "style" | "typography" | "details" | "export";

const DEFAULT_TOUR_DATES: PosterTourDate[] = [
  { date: "NOV 14", city: "Portland, OR", venue: "Mississippi Studios" },
  { date: "NOV 15", city: "Seattle, WA", venue: "Tractor Tavern" },
  { date: "NOV 17", city: "Bellingham, WA", venue: "The Shakedown" },
  { date: "NOV 19", city: "Boise, ID", venue: "Neurolux" },
  { date: "NOV 21", city: "Salt Lake City, UT", venue: "Urban Lounge" },
];

export default function PosterDesigner({
  config,
  onChangeConfig,
  currentUser,
  currentAccount,
}: PosterDesignerProps) {
  const [activeTab, setActiveTab] = useState<WorkbenchTab>("style");
  const [slogans, setSlogans] = useState<SloganProposal[]>([]);
  const [isGeneratingSlogans, setIsGeneratingSlogans] = useState(false);
  const [appliedSloganIdx, setAppliedSloganIdx] = useState<number | null>(null);
  const [saveToast, setSaveToast] = useState<{
    show: boolean;
    message: string;
    isError?: boolean;
  } | null>(null);

  const [selectedFormat, setSelectedFormat] = useState<
    "11x17" | "12x18" | "4.25x5.5" | "png"
  >("11x17");
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [mobileShowPreview, setMobileShowPreview] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync linked account band name if bandName is empty
  useEffect(() => {
    const linkedBandName =
      currentAccount?.type === "Band" && currentAccount?.name
        ? currentAccount.name
        : currentAccount?.name ||
          (currentUser as any)?.band_name ||
          (currentUser as any)?.name ||
          "";

    if (linkedBandName && !config.bandName) {
      onChangeConfig({
        ...config,
        bandName: linkedBandName,
      });
    }
  }, [currentAccount, currentUser]);

  const posterType: PosterTypeId = config.posterType || "single-show";
  const aspectRatio: PosterAspectRatio = config.aspectRatio || "2:3";
  const layoutId = config.layoutId || "centered";
  const frameStyle = config.frameStyle || "solid";
  const textureId = config.textureId || "none";
  const emblemId = config.emblemId || "none";
  const headlineScale = config.headlineScale ?? 1;
  const letterSpacing = config.letterSpacing || "tight";
  const imageOpacity = config.imageOpacity ?? 0.35;
  const tourDates =
    config.tourDates && config.tourDates.length > 0
      ? config.tourDates
      : DEFAULT_TOUR_DATES;

  const handleFieldChange = <K extends keyof PosterConfig>(
    field: K,
    value: PosterConfig[K]
  ) => {
    onChangeConfig({
      ...config,
      [field]: value,
    });
  };

  const handleSelectPosterType = (typeId: PosterTypeId) => {
    const preset = POSTER_TYPE_PRESETS.find((p) => p.id === typeId);
    const nextConfig: PosterConfig = {
      ...config,
      posterType: typeId,
      aspectRatio: preset?.recommendedAspect || "2:3",
    };
    if (typeId === "tour-dates" && (!config.tourDates || config.tourDates.length === 0)) {
      nextConfig.tourDates = DEFAULT_TOUR_DATES;
      if (!config.secondaryText) nextConfig.secondaryText = "FALL WEST COAST TOUR 2026";
    } else if (typeId === "album-release") {
      if (!config.albumTitle) nextConfig.albumTitle = "NEON HORIZON LP";
      if (!config.secondaryText) nextConfig.secondaryText = "OFFICIAL RECORD RELEASE SHOW";
    } else if (typeId === "festival-bill") {
      if (!config.festivalName) nextConfig.festivalName = "CASCADE SOUND FEST";
      if (!config.secondaryText) nextConfig.secondaryText = "TWO STAGES · ALL NIGHT SHOWCASE";
    }
    onChangeConfig(nextConfig);
    if (preset?.recommendedExport) {
      setSelectedFormat(preset.recommendedExport);
    }
  };

  const handleCustomColorChange = (
    key: "bg" | "text" | "accent",
    hex: string
  ) => {
    onChangeConfig({
      ...config,
      customColors: {
        ...(config.customColors || {}),
        [key]: hex,
      },
    });
  };

  const handleClearCustomColors = () => {
    const next = { ...config };
    delete next.customColors;
    onChangeConfig(next);
  };

  const handleAmenityChange = (
    key: "servesFood" | "servesAlcohol" | "merchArea"
  ) => {
    onChangeConfig({
      ...config,
      amenities: {
        ...config.amenities,
        [key]: !config.amenities[key],
      },
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      setSaveToast({
        show: true,
        message: "Please choose an image under 6 MB.",
        isError: true,
      });
      setTimeout(() => setSaveToast(null), 3500);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChangeConfig({
          ...config,
          customImageUrl: reader.result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTourDateChange = (
    idx: number,
    field: keyof PosterTourDate,
    val: string
  ) => {
    const updated = tourDates.map((row, i) =>
      i === idx ? { ...row, [field]: val } : row
    );
    handleFieldChange("tourDates", updated);
  };

  const handleAddTourDate = () => {
    handleFieldChange("tourDates", [
      ...tourDates,
      { date: "NOV 23", city: "Denver, CO", venue: "Hi-Dive" },
    ]);
  };

  const handleRemoveTourDate = (idx: number) => {
    if (tourDates.length <= 1) return;
    handleFieldChange(
      "tourDates",
      tourDates.filter((_, i) => i !== idx)
    );
  };

  const handleRandomizeDesign = () => {
    const rand = <T,>(arr: T[]): T =>
      arr[Math.floor(Math.random() * arr.length)];
    const theme = rand(POSTER_THEMES);
    const swatch = rand(COLOR_SWATCHES);
    const font = rand(FONT_STYLES);
    const layout = rand(LAYOUT_OPTIONS);
    const frame = rand(FRAME_STYLE_OPTIONS);
    const texture = rand(TEXTURE_OPTIONS);
    const emblem = rand(EMBLEM_OPTIONS.filter((e) => e.id !== "none"));
    const nextConfig: PosterConfig = {
      ...config,
      themeId: theme.id,
      colorId: swatch.id,
      fontStyle: font.id,
      layoutId: layout.id,
      frameStyle: frame.id,
      textureId: texture.id,
      emblemId: emblem.id,
    };
    delete nextConfig.customColors;
    onChangeConfig(nextConfig);
  };

  const handleResetDesign = () => {
    const resetConfig: PosterConfig = {
      ...config,
      themeId: "heavy-grunge",
      colorId: "default",
      fontStyle: "impact",
      layoutId: "centered",
      frameStyle: "solid",
      textureId: "none",
      emblemId: "none",
      headlineScale: 1,
      letterSpacing: "tight",
      showBleedGuides: false,
    };
    delete resetConfig.customColors;
    delete resetConfig.customImageUrl;
    onChangeConfig(resetConfig);
  };

  const handleSavePoster = () => {
    try {
      localStorage.setItem("user_saved_poster_v1", JSON.stringify(config));
      setSaveToast({
        show: true,
        message: "Poster design saved locally",
        isError: false,
      });
      setTimeout(() => setSaveToast(null), 3000);
    } catch (e: any) {
      setSaveToast({
        show: true,
        message: `Save error: ${e?.message || e}`,
        isError: true,
      });
    }
  };

  // Safe HTML2Canvas capture pipeline (strips Tailwind v4 oklch rules cleanly)
  const captureConcertPosterCanvas = async (
    element: HTMLElement
  ): Promise<HTMLCanvasElement> => {
    try {
      if (document.fonts && document.fonts.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 600)),
        ]);
      }
    } catch (_) {}

    const sanitizedNodes: {
      el: HTMLElement;
      mixBlend: string;
      backdrop: string;
      filter: string;
    }[] = [];

    try {
      const allDomElements = [
        element,
        ...Array.from(element.querySelectorAll("*")),
      ] as HTMLElement[];
      allDomElements.forEach((el) => {
        if (!el || !el.style) return;
        const comp = window.getComputedStyle(el);
        const hasMix = comp.mixBlendMode && comp.mixBlendMode !== "normal";
        const hasBackdrop =
          (comp as any).backdropFilter &&
          (comp as any).backdropFilter !== "none";
        const hasDropShadow =
          comp.filter && comp.filter.includes("drop-shadow");

        if (
          hasMix ||
          hasBackdrop ||
          hasDropShadow ||
          el.style.mixBlendMode ||
          (el.style as any).backdropFilter
        ) {
          sanitizedNodes.push({
            el,
            mixBlend: el.style.mixBlendMode,
            backdrop: (el.style as any).backdropFilter || "",
            filter: el.style.filter,
          });
          el.style.mixBlendMode = "normal";
          (el.style as any).backdropFilter = "none";
          (el.style as any).webkitBackdropFilter = "none";
          if (el.style.filter) {
            el.style.filter = el.style.filter
              .replace(/drop-shadow\([^)]*\)/gi, "")
              .trim();
          }
        }
      });

      const html2canvasOptions = {
        useCORS: true,
        allowTaint: false,
        scale: 3,
        logging: false,
        foreignObjectRendering: false,
        backgroundColor: null,
        ignoreElements: (el: Element) =>
          el.classList?.contains("no-export") || false,
        onclone: (clonedDoc: Document) => {
          const clonedPoster = (clonedDoc.getElementById(
            "poster-canvas-preview"
          ) ||
            clonedDoc.getElementById(
              "concert-poster-frame"
            )) as HTMLElement | null;
          if (!clonedPoster) return;

          try {
            const srcEls = [
              element,
              ...Array.from(element.querySelectorAll("*")),
            ] as HTMLElement[];
            const dstEls = [
              clonedPoster,
              ...Array.from(clonedPoster.querySelectorAll("*")),
            ] as HTMLElement[];
            for (let i = 0; i < srcEls.length && i < dstEls.length; i++) {
              const src = srcEls[i];
              const dst = dstEls[i];
              if (src && dst) {
                const srcStyle = window.getComputedStyle(src);
                dst.style.display = srcStyle.display;
                dst.style.flexDirection = srcStyle.flexDirection;
                dst.style.justifyContent = srcStyle.justifyContent;
                dst.style.alignItems = srcStyle.alignItems;
                dst.style.flexWrap = srcStyle.flexWrap;
                dst.style.gap = srcStyle.gap;
                dst.style.width = `${src.offsetWidth}px`;
                if (src.offsetHeight && !dst.style.height) {
                  dst.style.minHeight = `${src.offsetHeight}px`;
                }
                dst.style.padding = srcStyle.padding;
                dst.style.margin = srcStyle.margin;
                dst.style.textAlign = srcStyle.textAlign;
                dst.style.borderRadius = srcStyle.borderRadius;
                dst.style.borderWidth = srcStyle.borderWidth;
                dst.style.borderStyle = srcStyle.borderStyle;
                dst.style.fontSize = srcStyle.fontSize;
                dst.style.fontWeight = srcStyle.fontWeight;
                dst.style.fontFamily = srcStyle.fontFamily;
                dst.style.letterSpacing = srcStyle.letterSpacing;
                dst.style.lineHeight = srcStyle.lineHeight;
                dst.style.textTransform = srcStyle.textTransform;
                dst.style.position = srcStyle.position;
                dst.style.overflow = srcStyle.overflow;
                dst.style.opacity = srcStyle.opacity;
                if (srcStyle.position === "absolute") {
                  dst.style.top = srcStyle.top;
                  dst.style.left = srcStyle.left;
                  dst.style.right = srcStyle.right;
                  dst.style.bottom = srcStyle.bottom;
                }
              }
            }
          } catch (_) {}

          try {
            clonedDoc
              .querySelectorAll('style, link[rel="stylesheet"]')
              .forEach((s) => s.remove());
          } catch (_) {}

          const convertToHexOrRgb = (el: HTMLElement) => {
            if (!el) return;
            try {
              const computed = window.getComputedStyle(el);
              if (el.style) {
                if (
                  !el.style.backgroundColor ||
                  el.style.backgroundColor.includes("oklch") ||
                  (computed &&
                    computed.backgroundColor &&
                    computed.backgroundColor.includes("oklch"))
                ) {
                  el.style.backgroundColor =
                    el.style.backgroundColor &&
                    !el.style.backgroundColor.includes("oklch")
                      ? el.style.backgroundColor
                      : "transparent";
                }
                if (
                  !el.style.color ||
                  el.style.color.includes("oklch") ||
                  (computed &&
                    computed.color &&
                    computed.color.includes("oklch"))
                ) {
                  el.style.color =
                    el.style.color && !el.style.color.includes("oklch")
                      ? el.style.color
                      : "#ffffff";
                }
                if (
                  !el.style.borderColor ||
                  el.style.borderColor.includes("oklch") ||
                  (computed &&
                    computed.borderColor &&
                    computed.borderColor.includes("oklch"))
                ) {
                  el.style.borderColor =
                    el.style.borderColor &&
                    !el.style.borderColor.includes("oklch")
                      ? el.style.borderColor
                      : "#27272a";
                }
                el.style.mixBlendMode = "normal";
                (el.style as any).backdropFilter = "none";
                (el.style as any).webkitBackdropFilter = "none";
                if (el.style.filter && el.style.filter.includes("drop-shadow")) {
                  el.style.filter = "none";
                }
              }
            } catch (_) {}
            Array.from(el.children).forEach((child) =>
              convertToHexOrRgb(child as HTMLElement)
            );
          };

          convertToHexOrRgb(clonedPoster);

          const imgs = clonedPoster.querySelectorAll("img");
          imgs.forEach((img) => {
            if (!img.complete || img.naturalWidth === 0) {
              img.classList.add("no-export");
              img.style.display = "none";
            }
          });
        },
      };

      try {
        return await html2canvas(element, html2canvasOptions);
      } catch (_) {
        return await html2canvas(element, {
          ...html2canvasOptions,
          imageTimeout: 1500,
        });
      }
    } finally {
      sanitizedNodes.forEach(({ el, mixBlend, backdrop, filter }) => {
        el.style.mixBlendMode = mixBlend;
        (el.style as any).backdropFilter = backdrop;
        (el.style as any).webkitBackdropFilter = backdrop;
        el.style.filter = filter;
      });
    }
  };

  const handleDownloadPosterOrFlyer = async () => {
    const element =
      document.getElementById("poster-canvas-preview") ||
      document.getElementById("concert-poster-frame");
    if (!element) {
      setSaveToast({
        show: true,
        message: "Download failed: Poster canvas not found",
        isError: true,
      });
      return;
    }

    setIsExporting(true);
    setExportNotice(
      selectedFormat === "png"
        ? "Rendering 300 DPI PNG..."
        : `Rendering ${selectedFormat} PDF...`
    );

    try {
      await new Promise((r) => setTimeout(r, 80));
      const canvas = await captureConcertPosterCanvas(element);
      const headlineBandName = (config.bandName || "gig").trim();
      const sanitizedName = headlineBandName.replace(/\s+/g, "_");

      if (selectedFormat === "png") {
        await new Promise<void>((resolve, reject) => {
          if (!canvas.toBlob) {
            try {
              const dataUrl = canvas.toDataURL("image/png");
              const link = document.createElement("a");
              link.download = `${sanitizedName}_flyer.png`;
              link.href = dataUrl;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              resolve();
            } catch (err) {
              reject(err);
            }
            return;
          }

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("Unable to generate image blob"));
              return;
            }
            try {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.download = `${sanitizedName}_flyer.png`;
              link.href = url;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => URL.revokeObjectURL(url), 2000);
              resolve();
            } catch (clickErr) {
              reject(clickErr);
            }
          }, "image/png");
        });
      } else {
        let width = 11;
        let height = 17;
        if (selectedFormat === "12x18") {
          width = 12;
          height = 18;
        } else if (selectedFormat === "4.25x5.5") {
          width = 4.25;
          height = 5.5;
        }

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "in",
          format: [width, height],
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const canvasAspect = canvas.width / Math.max(1, canvas.height);
        const pageAspect = width / height;
        let drawW = width;
        let drawH = height;
        let offsetX = 0;
        let offsetY = 0;

        if (Math.abs(canvasAspect - pageAspect) > 0.04) {
          // Fill PDF sheet with poster background HEX so centered non-2:3 layouts print cleanly without distortion
          const bgHex = c.palette.bg || "#0a0a0a";
          const r = parseInt(bgHex.slice(1, 3), 16) || 10;
          const g = parseInt(bgHex.slice(3, 5), 16) || 10;
          const b = parseInt(bgHex.slice(5, 7), 16) || 10;
          pdf.setFillColor(r, g, b);
          pdf.rect(0, 0, width, height, "F");

          if (canvasAspect > pageAspect) {
            drawW = width;
            drawH = width / canvasAspect;
            offsetY = (height - drawH) / 2;
          } else {
            drawH = height;
            drawW = height * canvasAspect;
            offsetX = (width - drawW) / 2;
          }
        }

        pdf.addImage(imgData, "JPEG", offsetX, offsetY, drawW, drawH, undefined, "FAST");
        pdf.save(`${sanitizedName}_poster_${selectedFormat}.pdf`);
      }

      setExportNotice("Downloaded");
      setSaveToast({
        show: true,
        message: "Poster downloaded successfully",
        isError: false,
      });
      setTimeout(() => {
        setExportNotice(null);
        setSaveToast(null);
      }, 3500);
    } catch (err: any) {
      setSaveToast({
        show: true,
        message: `Download failed: ${err?.message || "Export error"}`,
        isError: true,
      });
      setExportNotice(null);
      setTimeout(() => setSaveToast(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateSlogans = async () => {
    if (!config.bandName) {
      setSaveToast({
        show: true,
        message: "Enter a band name first to generate AI slogan ideas.",
        isError: true,
      });
      setTimeout(() => setSaveToast(null), 3000);
      return;
    }

    setIsGeneratingSlogans(true);
    try {
      const res = await fetch("/api/suggest-slogans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bandName: config.bandName,
          genre: config.themeId,
          venueName: config.venueName,
        }),
      });
      if (!res.ok) throw new Error("Slogan API error");
      const data = await res.json();
      setSlogans(data);
    } catch (_) {
      setSlogans([
        { slogan: "LIVE AND LOUD", context: "All-caps top banner" },
        { slogan: "ONE NIGHT ONLY", context: "Sub-header above venue" },
        { slogan: "ALL AGES WELCOME", context: "Door policy callout" },
        { slogan: "DOORS OPEN EARLY", context: "Stage time kicker" },
        { slogan: "LIMITED CAPACITY", context: "Ticket urgency line" },
      ]);
    } finally {
      setIsGeneratingSlogans(false);
    }
  };

  const handleApplySlogan = (sloganText: string, idx: number) => {
    handleFieldChange("secondaryText", sloganText.toUpperCase());
    setAppliedSloganIdx(idx);
    setTimeout(() => setAppliedSloganIdx(null), 1800);
  };

  const c = getThemeClasses(
    config.themeId,
    config.colorId || "default",
    config.customColors
  );
  const textureStyle = getTextureStyle(textureId, c.palette.accent);
  const aspectMeta =
    ASPECT_RATIO_OPTIONS.find((a) => a.id === aspectRatio) ||
    ASPECT_RATIO_OPTIONS[0];

  // Calculate dynamic border styles safely in HEX for HTML2Canvas compatibility
  const getFrameBorderCss = (): React.CSSProperties => {
    switch (frameStyle) {
      case "double":
        return {
          borderWidth: "6px",
          borderStyle: "double",
          borderColor: c.palette.border,
          borderRadius: "4px",
        };
      case "brutalist":
        return {
          borderWidth: "6px",
          borderStyle: "solid",
          borderColor: c.palette.border,
          borderRadius: "0px",
        };
      case "dashed":
        return {
          borderWidth: "3px",
          borderStyle: "dashed",
          borderColor: c.palette.border,
          borderRadius: "8px",
        };
      case "corners":
      case "bleed":
        return {
          borderWidth: "0px",
          borderStyle: "none",
          borderColor: "transparent",
          borderRadius: "2px",
        };
      case "solid":
      default:
        return {
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: c.palette.border,
          borderRadius: "6px",
        };
    }
  };

  const isLeftAligned = layoutId === "editorial-left";
  const isBoldStack = layoutId === "bold-stack";
  const isSplitHorizon = layoutId === "split-band";

  const trackingCss =
    letterSpacing === "wide"
      ? "0.08em"
      : letterSpacing === "normal"
      ? "0.01em"
      : "-0.03em";

  const bandTitleFontSize = `${Math.round(36 * headlineScale)}px`;

  // Reusable Live Canvas Preview Component (identical DOM id for export)
  const renderLivePosterCanvas = () => (
    <div className="flex flex-col items-center w-full">
      <div
        className="relative p-2 rounded-xl border border-slate-700/80"
        style={{ backgroundColor: "#0f172a" }}
      >
        <div
          id="poster-canvas-preview"
          data-testid="concert-poster-frame"
          className={`overflow-hidden flex flex-col justify-between relative select-none ${c.frameClasses} ${
            isLeftAligned ? "text-left" : "text-center"
          }`}
          style={{
            ...c.frameStyle,
            ...getFrameBorderCss(),
            width: `${aspectMeta.maxWidthPx}px`,
            maxWidth: "100%",
            aspectRatio: aspectMeta.ratioStyle,
            padding: aspectRatio === "9:16" ? "24px 20px" : "24px",
          }}
        >
          {/* Optional Custom Uploaded Photo Layer */}
          {config.customImageUrl && (
            <img
              src={config.customImageUrl}
              alt="Custom poster artwork"
              referrerPolicy="no-referrer"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: imageOpacity,
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
          )}

          {/* Optional Texture Pattern Layer */}
          {textureId !== "none" && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 1,
                ...textureStyle,
              }}
            />
          )}

          {/* Crop Corner Brackets for "corners" Frame */}
          {frameStyle === "corners" && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "10px",
                pointerEvents: "none",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "18px",
                  height: "18px",
                  borderTop: `3px solid ${c.palette.accent}`,
                  borderLeft: `3px solid ${c.palette.accent}`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "18px",
                  height: "18px",
                  borderTop: `3px solid ${c.palette.accent}`,
                  borderRight: `3px solid ${c.palette.accent}`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "18px",
                  height: "18px",
                  borderBottom: `3px solid ${c.palette.accent}`,
                  borderLeft: `3px solid ${c.palette.accent}`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "18px",
                  height: "18px",
                  borderBottom: `3px solid ${c.palette.accent}`,
                  borderRight: `3px solid ${c.palette.accent}`,
                }}
              />
            </div>
          )}

          {/* Subtle Theme Artwork Overlays (safe HEX gradients only) */}
          {config.themeId === "retro-neon" && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  height: "96px",
                  backgroundImage: `linear-gradient(to top, ${c.palette.accent}28, transparent)`,
                  borderTop: `1px solid ${c.palette.accent}40`,
                }}
              />
            </div>
          )}

          {config.themeId === "punk-diy" && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 1,
                borderTop: "10px solid #000000",
                borderBottom: "10px solid #000000",
              }}
            />
          )}

          {/* Optional Print Bleed & Trim Safety Overlay (excluded from final download via .no-export) */}
          {config.showBleedGuides && (
            <div
              className="no-export"
              style={{
                position: "absolute",
                inset: "10px",
                border: "1px dashed #22d3ee",
                pointerEvents: "none",
                zIndex: 20,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "-8px",
                  left: "6px",
                  backgroundColor: "#0f172a",
                  color: "#22d3ee",
                  fontSize: "8px",
                  fontFamily: "monospace",
                  padding: "0 4px",
                }}
              >
                0.125&quot; SAFE TRIM
              </span>
            </div>
          )}

          {/* TOP SECTION: Poster Type Kicker / Slogan / Headline */}
          <div
            id="poster-layout-top"
            style={{
              position: "relative",
              zIndex: 5,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              alignItems: isLeftAligned ? "flex-start" : "center",
            }}
          >
            {/* Type Kicker / Slogan */}
            <div
              id="poster-tagline-preview"
              className={c.taglineClasses}
              style={{
                ...c.taglineStyle,
                fontSize: "10px",
                letterSpacing: "0.14em",
                backgroundColor: isBoldStack
                  ? c.palette.accent
                  : c.taglineStyle.backgroundColor,
                color: isBoldStack ? c.palette.bg : c.taglineStyle.color,
                padding: isBoldStack ? "3px 8px" : undefined,
                width: isBoldStack ? "100%" : undefined,
              }}
            >
              {posterType === "festival-bill" && config.festivalName
                ? `${config.festivalName} · ${
                    config.secondaryText || "OFFICIAL SHOWCASE"
                  }`
                : posterType === "album-release"
                ? config.secondaryText || "OFFICIAL RECORD RELEASE SHOW"
                : posterType === "tour-dates"
                ? config.secondaryText || "ON TOUR 2026"
                : config.secondaryText || "LIVE ON STAGE · ONE NIGHT ONLY"}
            </div>

            {/* Headline Band Name */}
            <div
              role="heading"
              aria-level={2}
              id="poster-band-preview"
              className={`leading-none ${getPosterFontClass(config.fontStyle)} ${
                !config.bandName ? "opacity-55" : ""
              }`}
              style={{
                ...c.bandNameStyle,
                fontSize: bandTitleFontSize,
                letterSpacing: trackingCss,
                lineHeight: 0.96,
                backgroundColor: isBoldStack
                  ? c.palette.text
                  : c.bandNameStyle.backgroundColor,
                color: isBoldStack ? c.palette.bg : c.bandNameStyle.color,
                padding: isBoldStack ? "8px 10px" : undefined,
                width: isBoldStack ? "100%" : undefined,
              }}
            >
              {config.bandName || "THE MIDNIGHT ECHOES"}
            </div>

            {/* Album Release Banner if Album Release Type */}
            {posterType === "album-release" && (
              <div
                style={{
                  border: `1.5px solid ${c.palette.accent}`,
                  backgroundColor: c.palette.badgeBg,
                  color: c.palette.accent,
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {config.albumTitle || "NEW ALBUM OUT NOW"}
              </div>
            )}

            {/* Supporting Acts / Lineup */}
            {posterType !== "tour-dates" && (
              <div id="poster-supporting-acts-preview" style={{ paddingTop: "2px" }}>
                <div
                  className={c.supportingActsClasses}
                  style={{
                    ...c.supportingActsStyle,
                    fontSize: posterType === "festival-bill" ? "11px" : "10px",
                    padding: "4px 8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {config.supportingActs ||
                    (posterType === "festival-bill"
                      ? "Velvet Rust · The Drifters · Copper Pines · Neon Alley"
                      : "With Special Guests: Velvet Rust & The Drifters")}
                </div>
              </div>
            )}
          </div>

          {/* MIDDLE SECTION: Centerpiece Emblem + Venue OR Tour Dates Table */}
          <div
            id="poster-layout-mid"
            style={{
              position: "relative",
              zIndex: 5,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              alignItems: isLeftAligned ? "flex-start" : "center",
              borderTop: isSplitHorizon
                ? `1px solid ${c.palette.border}`
                : undefined,
              borderBottom: isSplitHorizon
                ? `1px solid ${c.palette.border}`
                : undefined,
              paddingTop: isSplitHorizon ? "10px" : "4px",
              paddingBottom: isSplitHorizon ? "10px" : "4px",
            }}
          >
            {/* Vector SVG Emblem */}
            {emblemId !== "none" && (
              <div style={{ margin: "2px 0" }}>
                {renderPosterEmblemSvg(emblemId, c.palette.accent)}
              </div>
            )}

            {/* Tour Dates Routing List when Poster Type = "tour-dates" */}
            {posterType === "tour-dates" ? (
              <div
                style={{
                  width: "100%",
                  borderTop: `1px solid ${c.palette.border}`,
                  borderBottom: `1px solid ${c.palette.border}`,
                  padding: "6px 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {tourDates.slice(0, 7).map((stop, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "10px",
                      fontFamily: "monospace",
                      borderBottom:
                        idx < Math.min(tourDates.length, 7) - 1
                          ? `1px dotted ${c.palette.border}`
                          : "none",
                      paddingBottom: "3px",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: c.palette.accent, fontWeight: 800 }}>
                      {stop.date || "TBA"}
                    </span>
                    <span
                      style={{
                        color: c.palette.text,
                        fontWeight: 700,
                        flex: 1,
                        textAlign: "left",
                      }}
                    >
                      {stop.city}
                    </span>
                    <span style={{ color: c.palette.sub, fontSize: "9px" }}>
                      {stop.venue}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div id="venue-text-previews" style={{ width: "100%" }}>
                <div
                  id="poster-venue-name-preview"
                  className={c.venueNameClasses}
                  style={{
                    ...c.venueNameStyle,
                    fontSize: "15px",
                    lineHeight: 1.25,
                  }}
                >
                  {config.venueName || "THE CRYSTAL BALLROOM · PORTLAND, OR"}
                </div>
                {config.venueAddress && (
                  <div
                    id="poster-venue-addr-preview"
                    style={{
                      color: c.palette.sub,
                      fontSize: "10px",
                      marginTop: "2px",
                    }}
                  >
                    {config.venueAddress}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BOTTOM SECTION: Date, Ticket Price, Age Policy, Amenities & QR Stamp */}
          <div
            id="poster-layout-bottom"
            style={{
              position: "relative",
              zIndex: 5,
              borderTop: `1px solid ${c.palette.border}`,
              paddingTop: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: config.ticketUrl
                  ? "space-between"
                  : isLeftAligned
                  ? "flex-start"
                  : "center",
                alignItems: "center",
                gap: "10px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  alignItems: config.ticketUrl || isLeftAligned ? "flex-start" : "center",
                  flex: 1,
                }}
              >
                <div
                  id="poster-date-preview"
                  className={c.dateBadgeClasses}
                  style={{
                    ...c.dateBadgeStyle,
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: frameStyle === "brutalist" ? "0px" : "4px",
                  }}
                >
                  {posterType === "tour-dates"
                    ? config.supportingActs || "TICKETS ON SALE NOW"
                    : config.dateStr || "FRI NOV 14 · DOORS 7PM / SHOW 8PM"}
                </div>

                {config.timeStr && (
                  <div
                    id="poster-time-preview"
                    className={c.timeBadgeClasses}
                    style={{
                      ...c.timeBadgeStyle,
                      fontSize: "10px",
                      padding: "2px 6px",
                    }}
                  >
                    {config.timeStr}
                  </div>
                )}

                <div
                  id="pricing-age-preview"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: c.palette.text }}>
                    {config.priceStr || "$15 ADV / $20 DOOR"}
                  </span>
                  <span
                    id="poster-age-badge"
                    style={{
                      backgroundColor: c.palette.accent,
                      color: c.palette.bg,
                      padding: "1px 6px",
                      fontSize: "9px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {config.allAges || "All Ages"}
                  </span>
                </div>
              </div>

              {config.ticketUrl && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    padding: "4px",
                    backgroundColor: "#ffffff",
                    border: `1.5px solid ${c.palette.border}`,
                    flexShrink: 0,
                  }}
                >
                  {renderTicketQrStampSvg(
                    config.ticketUrl,
                    "#000000",
                    "#ffffff"
                  )}
                  <span
                    style={{
                      fontSize: "7px",
                      fontFamily: "monospace",
                      fontWeight: 800,
                      color: "#000000",
                      textTransform: "uppercase",
                    }}
                  >
                    TICKETS
                  </span>
                </div>
              )}
            </div>

            {(config.amenities.servesFood ||
              config.amenities.servesAlcohol ||
              config.amenities.merchArea) && (
              <div
                id="poster-amenities-pills"
                style={{
                  display: "flex",
                  justifyContent: isLeftAligned ? "flex-start" : "center",
                  gap: "10px",
                  fontSize: "9px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: c.palette.sub,
                }}
              >
                {config.amenities.servesFood && <span>FOOD AVAILABLE</span>}
                {config.amenities.servesAlcohol && <span>FULL BAR</span>}
                {config.amenities.merchArea && <span>MERCH BOOTH</span>}
              </div>
            )}

            {config.extraDetails && (
              <div
                id="poster-notes-preview"
                style={{
                  fontSize: "9px",
                  color: c.palette.sub,
                  letterSpacing: "0.02em",
                }}
              >
                {config.extraDetails}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Format Specs Summary Line below canvas */}
      <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-400 font-mono tabular-nums">
        <span>{aspectMeta.label}</span>
        <span aria-hidden="true">·</span>
        <span>{aspectMeta.dims}</span>
        <span aria-hidden="true">·</span>
        <span>300 DPI Export</span>
      </div>
    </div>
  );

  // Fireball Print Fulfillment Card
  const renderFireballCard = () => (
    <div
      id="fireball-printing-recommendation"
      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 text-white space-y-3 text-left"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-amber-400">
              Physical Print Fulfillment
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Print Physical Flyers with Fireball Printing
            </h4>
          </div>
        </div>

        <a
          href="https://fireballprinting.com"
          target="_blank"
          rel="noopener noreferrer"
          id="btn-fireball-printing-link"
          className="inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Order on Fireball Printing</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        Download your 300 DPI print-ready PDF (`11×17`, `12×18`, or `4.25×5.5` quarter-sheet handbill) and upload directly for indie-friendly band runs on 100lb gloss or heavy cardstock.
      </p>
    </div>
  );

  return (
    <div
      className="flex flex-col space-y-6 w-full max-w-7xl mx-auto"
      id="poster-designer-panel"
    >
      {/* TOP WORKSPACE HEADER & POSTER TYPE SELECTOR */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div>
            <h1
              className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2"
              id="controls-title"
            >
              <Layers className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>Poster &amp; Concert Flyer Studio</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose your poster type, customize typography and artwork side-by-side, and export print-ready 300 DPI files.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {saveToast && (
              <span
                className={`text-xs font-semibold flex items-center gap-1 mr-1 ${
                  saveToast.isError ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {saveToast.isError ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{saveToast.message}</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleRandomizeDesign}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              title="Generate a fresh visual style combination"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Randomize Look</span>
            </button>
            <button
              type="button"
              onClick={handleResetDesign}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              id="btn-poster-save"
              onClick={handleSavePoster}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Design</span>
            </button>
          </div>
        </div>

        {/* POSTER TYPE SELECTOR ROW */}
        <div className="space-y-2" id="poster-type-selector-bar">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Poster Type
            </span>
            <span className="text-xs text-slate-500">
              {
                POSTER_TYPE_PRESETS.find((p) => p.id === posterType)?.shortDesc
              }
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {POSTER_TYPE_PRESETS.map((preset) => {
              const active = posterType === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  id={`btn-poster-type-${preset.id}`}
                  onClick={() => handleSelectPosterType(preset.id)}
                  className={`px-3 py-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    active
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-xs font-bold truncate">
                    {preset.label}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 font-mono tabular-nums ${
                      active ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {preset.recommendedAspect} ·{" "}
                    {preset.recommendedExport.toUpperCase()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MOBILE VIEW SWITCHER (< lg only) */}
      <div className="lg:hidden flex items-center justify-between bg-slate-900 text-white rounded-xl p-2 border border-slate-800">
        <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setMobileShowPreview(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              mobileShowPreview
                ? "bg-white text-slate-900"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Preview + Controls
          </button>
          <button
            type="button"
            onClick={() => setMobileShowPreview(false)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              !mobileShowPreview
                ? "bg-white text-slate-900"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Editor Only
          </button>
        </div>

        <button
          type="button"
          onClick={handleDownloadPosterOrFlyer}
          disabled={isExporting}
          className="px-3.5 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? "Exporting..." : "Download"}</span>
        </button>
      </div>

      {/* MAIN ZERO-SCROLL SIDE-BY-SIDE STUDIO SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: TABBED DESIGN WORKBENCH (lg:col-span-6) */}
        <div
          className="lg:col-span-6 order-2 lg:order-1 bg-white rounded-xl border border-slate-200 overflow-hidden"
          id="designer-controls"
        >
          {/* Workbench Navigation Tabs */}
          <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 p-1.5 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("style")}
              className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "style"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Palette className="w-3.5 h-3.5 shrink-0" />
              <span>Style</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("typography")}
              className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "typography"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Type className="w-3.5 h-3.5 shrink-0" />
              <span>Type &amp; Art</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "details"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>Details</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("export")}
              className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "export"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Print &amp; Export</span>
            </button>
          </div>

          {/* Active Workbench Tab Panel */}
          <div className="p-4 sm:p-5 space-y-5 text-xs">
            {/* TAB 1: STYLE, LAYOUT, THEMES, FRAMES & CUSTOM COLORS */}
            {activeTab === "style" && (
              <div className="space-y-5" id="tab-panel-style">
                {/* Layout Arrangement */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <LayoutTemplate className="w-3.5 h-3.5 text-slate-500" />
                      Composition Layout
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {LAYOUT_OPTIONS.find((l) => l.id === layoutId)?.desc}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {LAYOUT_OPTIONS.map((lay) => {
                      const active = layoutId === lay.id;
                      return (
                        <button
                          key={lay.id}
                          type="button"
                          onClick={() => handleFieldChange("layoutId", lay.id)}
                          className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                            active
                              ? "border-indigo-600 bg-indigo-50 text-indigo-950 font-bold"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 font-medium"
                          }`}
                        >
                          <div className="text-[11px] truncate">{lay.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 14 Genre Visual Themes */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      Genre Theme Presets (14)
                    </span>
                    <span className="text-[11px] text-indigo-600 font-semibold">
                      {POSTER_THEMES.find((t) => t.id === config.themeId)?.label}
                    </span>
                  </div>
                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 gap-1.5"
                    id="themes-grid-input"
                  >
                    {POSTER_THEMES.map((th) => {
                      const active = config.themeId === th.id;
                      return (
                        <button
                          key={th.id}
                          type="button"
                          id={`btn-theme-${th.id}`}
                          onClick={() => handleFieldChange("themeId", th.id)}
                          className={`px-2.5 py-2 rounded-lg border text-left transition-colors cursor-pointer flex items-center gap-2 ${
                            active
                              ? "border-indigo-600 bg-indigo-50 text-indigo-950 font-bold"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 font-medium"
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-sm shrink-0 border border-black/15"
                            style={{ backgroundColor: th.swatch }}
                          />
                          <span className="text-[11px] truncate">
                            {th.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Swatches + Custom Color Pickers */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      Color Palette &amp; Custom Overrides
                    </span>
                    {config.customColors && (
                      <button
                        type="button"
                        onClick={handleClearCustomColors}
                        className="text-[11px] text-indigo-600 hover:underline cursor-pointer font-semibold"
                      >
                        Reset custom colors
                      </button>
                    )}
                  </div>

                  <div
                    className="flex flex-wrap gap-2 items-center"
                    id="color-swatches-row"
                  >
                    {COLOR_SWATCHES.map((sw) => {
                      const isSelected =
                        (config.colorId || "default") === sw.id &&
                        !config.customColors;
                      return (
                        <button
                          key={sw.id}
                          type="button"
                          id={`swatch-picker-btn-${sw.id}`}
                          title={sw.label}
                          onClick={() => {
                            const next = { ...config, colorId: sw.id };
                            delete next.customColors;
                            onChangeConfig(next);
                          }}
                          className={`w-7 h-7 rounded-full border cursor-pointer transition-transform flex items-center justify-center hover:scale-110 ${
                            isSelected
                              ? "ring-2 ring-indigo-600 ring-offset-2 border-white scale-110"
                              : "border-slate-300 opacity-90 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: sw.hex }}
                        >
                          {isSelected && (
                            <Check
                              className={`w-3.5 h-3.5 ${
                                sw.id === "default" ? "text-slate-900" : "text-white"
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <label className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                      <span className="text-[11px] font-medium text-slate-700">
                        Background
                      </span>
                      <input
                        type="color"
                        value={c.palette.bg}
                        onChange={(e) =>
                          handleCustomColorChange("bg", e.target.value)
                        }
                        className="w-6 h-6 border-0 bg-transparent cursor-pointer p-0"
                      />
                    </label>
                    <label className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                      <span className="text-[11px] font-medium text-slate-700">
                        Accent
                      </span>
                      <input
                        type="color"
                        value={c.palette.accent}
                        onChange={(e) =>
                          handleCustomColorChange("accent", e.target.value)
                        }
                        className="w-6 h-6 border-0 bg-transparent cursor-pointer p-0"
                      />
                    </label>
                    <label className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                      <span className="text-[11px] font-medium text-slate-700">
                        Ink / Text
                      </span>
                      <input
                        type="color"
                        value={c.palette.text}
                        onChange={(e) =>
                          handleCustomColorChange("text", e.target.value)
                        }
                        className="w-6 h-6 border-0 bg-transparent cursor-pointer p-0"
                      />
                    </label>
                  </div>
                </div>

                {/* Border & Frame Style */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="font-semibold text-slate-800 block">
                    Border &amp; Frame Style
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {FRAME_STYLE_OPTIONS.map((fr) => {
                      const active = frameStyle === fr.id;
                      return (
                        <button
                          key={fr.id}
                          type="button"
                          onClick={() => handleFieldChange("frameStyle", fr.id)}
                          className={`px-2.5 py-2 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                            active
                              ? "border-indigo-600 bg-indigo-50 text-indigo-950 font-bold"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 font-medium"
                          }`}
                        >
                          {fr.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TYPOGRAPHY, TEXTURES, EMBLEMS & IMAGE UPLOAD */}
            {activeTab === "typography" && (
              <div className="space-y-5" id="tab-panel-typography">
                {/* Font Pairing Picker */}
                <div className="space-y-2" id="typography-font-picker">
                  <span className="font-semibold text-slate-800 block">
                    Headline Display Typography (8)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {FONT_STYLES.map((f) => {
                      const active = (config.fontStyle || "impact") === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleFieldChange("fontStyle", f.id)}
                          className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                            active
                              ? "border-indigo-600 bg-indigo-50 text-indigo-950"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <div className="text-[10px] font-semibold text-slate-500">
                            {f.label}
                          </div>
                          <div className={`text-sm truncate mt-0.5 ${f.fontClass}`}>
                            {f.sample}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Headline Scale & Letter Spacing */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      Headline Size &amp; Spacing
                    </span>
                    <span className="font-mono text-[11px] text-slate-600 tabular-nums">
                      {Math.round(headlineScale * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.7}
                    max={1.4}
                    step={0.05}
                    value={headlineScale}
                    onChange={(e) =>
                      handleFieldChange(
                        "headlineScale",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["tight", "normal", "wide"] as const).map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => handleFieldChange("letterSpacing", sp)}
                        className={`py-1.5 px-2 rounded-lg border text-[11px] capitalize cursor-pointer ${
                          letterSpacing === sp
                            ? "border-indigo-600 bg-indigo-50 text-indigo-950 font-bold"
                            : "border-slate-200 bg-white text-slate-600 font-medium"
                        }`}
                      >
                        Tracking: {sp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Print Textures */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="font-semibold text-slate-800 block">
                    Surface Texture Overlay
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {TEXTURE_OPTIONS.map((tx) => {
                      const active = textureId === tx.id;
                      return (
                        <button
                          key={tx.id}
                          type="button"
                          onClick={() => handleFieldChange("textureId", tx.id)}
                          className={`px-2 py-2 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                            active
                              ? "border-indigo-600 bg-indigo-50 text-indigo-950 font-bold"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 font-medium"
                          }`}
                        >
                          {tx.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Centerpiece Vector Emblem */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="font-semibold text-slate-800 block">
                    Centerpiece Vector Graphic
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {EMBLEM_OPTIONS.map((em) => {
                      const active = emblemId === em.id;
                      return (
                        <button
                          key={em.id}
                          type="button"
                          onClick={() => handleFieldChange("emblemId", em.id)}
                          className={`py-2 px-1.5 rounded-lg border text-[11px] transition-colors cursor-pointer truncate ${
                            active
                              ? "border-indigo-600 bg-indigo-50 text-indigo-950 font-bold"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 font-medium"
                          }`}
                        >
                          {em.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Background Artwork Upload */}
                <div className="space-y-2.5 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      Background Photo / Album Art
                    </span>
                    {config.customImageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = { ...config };
                          delete next.customImageUrl;
                          onChangeConfig(next);
                        }}
                        className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 border border-dashed border-slate-300 hover:border-indigo-500 rounded-lg bg-slate-50 hover:bg-indigo-50/40 text-slate-700 font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>
                      {config.customImageUrl
                        ? "Replace Background Artwork"
                        : "Upload Band Photo or Album Cover"}
                    </span>
                  </button>

                  {config.customImageUrl && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Photo Opacity</span>
                        <span className="font-mono tabular-nums">
                          {Math.round(imageOpacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={0.85}
                        step={0.05}
                        value={imageOpacity}
                        onChange={(e) =>
                          handleFieldChange(
                            "imageOpacity",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: SHOW, TOUR, RELEASE & TICKET DETAILS */}
            {activeTab === "details" && (
              <div className="space-y-4" id="tab-panel-details">
                {/* Headline Band Name */}
                <div id="field-wrap-band">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Headline Artist / Band Name
                  </label>
                  <input
                    type="text"
                    id="field-poster-bandName"
                    value={config.bandName}
                    onChange={(e) =>
                      handleFieldChange("bandName", e.target.value)
                    }
                    placeholder="e.g., The Midnight Echoes"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-slate-900"
                  />
                </div>

                {/* Contextual Fields by Poster Type */}
                {posterType === "festival-bill" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Festival / Showcase Event Name
                    </label>
                    <input
                      type="text"
                      value={config.festivalName || ""}
                      onChange={(e) =>
                        handleFieldChange("festivalName", e.target.value)
                      }
                      placeholder="e.g., CASCADE SOUND FEST"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-900"
                    />
                  </div>
                )}

                {posterType === "album-release" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Album / Single Title Callout
                    </label>
                    <input
                      type="text"
                      value={config.albumTitle || ""}
                      onChange={(e) =>
                        handleFieldChange("albumTitle", e.target.value)
                      }
                      placeholder="e.g., NEON HORIZON LP — OUT EVERYWHERE"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-900"
                    />
                  </div>
                )}

                {/* Tour Subtitle / Header Slogan with Gemini AI */}
                <div id="field-wrap-tagline">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Top Tagline / Tour Kicker
                  </label>
                  <div className="flex gap-2" id="tagline-with-ai-btn">
                    <input
                      type="text"
                      id="field-poster-secondaryText"
                      value={config.secondaryText}
                      onChange={(e) =>
                        handleFieldChange("secondaryText", e.target.value)
                      }
                      placeholder="e.g., LIVE ON STAGE · ONE NIGHT ONLY"
                      className="flex-grow text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                    />
                    <button
                      type="button"
                      id="btn-trigger-ai-slogans"
                      onClick={handleGenerateSlogans}
                      disabled={isGeneratingSlogans || !config.bandName}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 flex items-center gap-1.5"
                    >
                      {isGeneratingSlogans ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5" />
                      )}
                      <span>AI Ideas</span>
                    </button>
                  </div>
                </div>

                {slogans.length > 0 && (
                  <div
                    className="bg-slate-50 rounded-lg p-3 space-y-1.5 border border-slate-200"
                    id="ai-slogans-results"
                  >
                    <div className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tap a tagline to apply:</span>
                    </div>
                    <div className="space-y-1">
                      {slogans.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleApplySlogan(s.slogan, i)}
                          className="w-full text-left bg-white border border-slate-200 hover:border-indigo-400 rounded-md px-2.5 py-1.5 text-[11px] flex justify-between items-center cursor-pointer"
                        >
                          <span className="font-semibold text-slate-900">
                            {s.slogan}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {appliedSloganIdx === i ? "Applied" : s.context}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tour Dates Table Editor OR Venue + Supporting Acts */}
                {posterType === "tour-dates" ? (
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        Tour Stops ({tourDates.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddTourDate}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Stop</span>
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {tourDates.map((stop, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={stop.date}
                            onChange={(e) =>
                              handleTourDateChange(idx, "date", e.target.value)
                            }
                            placeholder="NOV 14"
                            className="w-20 text-[11px] font-mono p-1.5 bg-slate-50 border border-slate-200 rounded"
                          />
                          <input
                            type="text"
                            value={stop.city}
                            onChange={(e) =>
                              handleTourDateChange(idx, "city", e.target.value)
                            }
                            placeholder="City, ST"
                            className="flex-1 text-[11px] p-1.5 bg-slate-50 border border-slate-200 rounded"
                          />
                          <input
                            type="text"
                            value={stop.venue}
                            onChange={(e) =>
                              handleTourDateChange(idx, "venue", e.target.value)
                            }
                            placeholder="Venue"
                            className="flex-1 text-[11px] p-1.5 bg-slate-50 border border-slate-200 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveTourDate(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Remove stop"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Supporting Acts */}
                    <div id="field-wrap-supporting-acts">
                      <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {posterType === "festival-bill"
                            ? "Festival Lineup"
                            : "Supporting Acts"}
                        </span>
                      </label>
                      <input
                        type="text"
                        id="field-poster-supportingActs"
                        value={config.supportingActs || ""}
                        onChange={(e) =>
                          handleFieldChange("supportingActs", e.target.value)
                        }
                        placeholder="e.g., Special Guests: Velvet Rust, The Drifters"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                      />
                    </div>

                    {/* Venue & Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div id="field-wrap-venue">
                        <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>Venue &amp; City</span>
                        </label>
                        <input
                          type="text"
                          id="field-poster-venueName"
                          value={config.venueName}
                          onChange={(e) =>
                            handleFieldChange("venueName", e.target.value)
                          }
                          placeholder="e.g., The Crystal Ballroom · Portland, OR"
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Street Address (Optional)
                        </label>
                        <input
                          type="text"
                          value={config.venueAddress}
                          onChange={(e) =>
                            handleFieldChange("venueAddress", e.target.value)
                          }
                          placeholder="e.g., 1332 W Burnside St"
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Date & Doors/Show Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div id="field-wrap-datetime">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Date &amp; Time
                        </label>
                        <input
                          type="text"
                          id="field-poster-dateStr"
                          value={config.dateStr}
                          onChange={(e) =>
                            handleFieldChange("dateStr", e.target.value)
                          }
                          placeholder="e.g., Fri Nov 14 · Doors 7PM"
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Secondary Time Badge
                        </label>
                        <input
                          type="text"
                          value={config.timeStr}
                          onChange={(e) =>
                            handleFieldChange("timeStr", e.target.value)
                          }
                          placeholder="e.g., Show Starts 8:30 PM Sharp"
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Ticket Price, Age Policy & QR Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div id="field-wrap-price">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Admission / Ticket Price
                    </label>
                    <input
                      type="text"
                      id="field-poster-priceStr"
                      value={config.priceStr}
                      onChange={(e) =>
                        handleFieldChange("priceStr", e.target.value)
                      }
                      placeholder="e.g., $15 Adv / $20 Door"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Age Restriction
                    </label>
                    <select
                      id="field-poster-allAges"
                      value={config.allAges}
                      onChange={(e) =>
                        handleFieldChange("allAges", e.target.value)
                      }
                      className="w-full p-2.5 text-xs border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                    >
                      <option value="All Ages">All Ages</option>
                      <option value="18+ w/ ID">18+ w/ ID</option>
                      <option value="21+ w/ ID">21+ w/ ID</option>
                    </select>
                  </div>
                </div>

                {/* Ticket QR Stamp & Extra Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                      <QrCode className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ticket URL (Adds QR Stamp)</span>
                    </label>
                    <input
                      type="text"
                      value={config.ticketUrl || ""}
                      onChange={(e) =>
                        handleFieldChange("ticketUrl", e.target.value)
                      }
                      placeholder="e.g., giglizard.us/shows/pdx"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Footer Credits / Sponsors
                    </label>
                    <input
                      type="text"
                      id="field-poster-extraDetails"
                      value={config.extraDetails}
                      onChange={(e) =>
                        handleFieldChange("extraDetails", e.target.value)
                      }
                      placeholder="e.g., Presented by Monolith Audio"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>
                </div>

                {/* Amenities Switches */}
                <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      id="check-poster-servesFood"
                      checked={config.amenities.servesFood}
                      onChange={() => handleAmenityChange("servesFood")}
                      className="rounded text-indigo-600"
                    />
                    <UtensilsCrossed className="w-3.5 h-3.5 text-slate-500" />
                    <span>Food Available</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      id="check-poster-servesAlcohol"
                      checked={config.amenities.servesAlcohol}
                      onChange={() => handleAmenityChange("servesAlcohol")}
                      className="rounded text-indigo-600"
                    />
                    <Wine className="w-3.5 h-3.5 text-slate-500" />
                    <span>Bar / Drinks</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      id="check-poster-merchArea"
                      checked={config.amenities.merchArea}
                      onChange={() => handleAmenityChange("merchArea")}
                      className="rounded text-indigo-600"
                    />
                    <span>Merch Booth</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: EXPORT, BLEED GUIDES & FIREBALL PRINT */}
            {activeTab === "export" && (
              <div className="space-y-5" id="tab-panel-export">
                {/* Format Selector */}
                <div className="space-y-2">
                  <span className="font-semibold text-slate-800 block">
                    Export File Format
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      id="btn-format-11x17"
                      onClick={() => setSelectedFormat("11x17")}
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        selectedFormat === "11x17"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold">11×17 Tabloid PDF</div>
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                        3300×5100 px equivalent
                      </div>
                    </button>

                    <button
                      type="button"
                      id="btn-format-12x18"
                      onClick={() => setSelectedFormat("12x18")}
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        selectedFormat === "12x18"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold">12×18 Full Bleed PDF</div>
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                        Venue wall / commercial print
                      </div>
                    </button>

                    <button
                      type="button"
                      id="btn-format-4.25x5.5"
                      onClick={() => setSelectedFormat("4.25x5.5")}
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        selectedFormat === "4.25x5.5"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold">
                        4.25×5.5 Handbill PDF
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                        Quarter-sheet street flyer
                      </div>
                    </button>

                    <button
                      type="button"
                      id="btn-format-png"
                      onClick={() => setSelectedFormat("png")}
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        selectedFormat === "png"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-950 font-bold"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold">Web &amp; Social PNG</div>
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                        High-DPI social image
                      </div>
                    </button>
                  </div>
                </div>

                {/* Print Bleed Overlay Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <Scissors className="w-4 h-4 text-slate-600" />
                    <div>
                      <div className="font-semibold text-slate-800">
                        Show 0.125&quot; Print Safety Guides
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Visualizes trim bounds in preview only (excluded from exports)
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleFieldChange(
                        "showBleedGuides",
                        !config.showBleedGuides
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      config.showBleedGuides
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-300 text-slate-700"
                    }`}
                  >
                    {config.showBleedGuides ? "On" : "Off"}
                  </button>
                </div>

                {/* Primary Download & Local Print */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    id="btn-download-poster-primary"
                    onClick={handleDownloadPosterOrFlyer}
                    disabled={isExporting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-3 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Rendering Export...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>
                          Download{" "}
                          {selectedFormat === "png"
                            ? "Web Flyer PNG"
                            : `${selectedFormat} Print PDF`}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Dialog</span>
                  </button>
                </div>

                {renderFireballCard()}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY LIVE PREVIEW STAGE (lg:col-span-6) */}
        <div
          className={`lg:col-span-6 order-1 lg:order-2 lg:sticky lg:top-20 ${
            mobileShowPreview ? "block" : "hidden lg:block"
          }`}
          id="poster-rendering-panel"
        >
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 sm:p-5 space-y-4">
            {/* Compact Aspect Ratio & Export Toolbar directly attached to preview */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {ASPECT_RATIO_OPTIONS.map((ar) => (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => handleFieldChange("aspectRatio", ar.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      aspectRatio === ar.id
                        ? "bg-white text-slate-900"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {exportNotice && (
                  <span className="text-[11px] font-semibold text-emerald-400">
                    {exportNotice}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleDownloadPosterOrFlyer}
                  disabled={isExporting}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {isExporting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>
                    Export{" "}
                    {selectedFormat === "png" ? "PNG" : `${selectedFormat} PDF`}
                  </span>
                </button>
              </div>
            </div>

            {/* Live Interactive Poster Canvas */}
            <div className="flex justify-center items-center py-2">
              {renderLivePosterCanvas()}
            </div>
          </div>
        </div>
      </div>

      {/* Semantic Educational Guide below the studio workbench for SEO & Print Prep */}
      <PosterDesignerSeoGuide />
    </div>
  );
}