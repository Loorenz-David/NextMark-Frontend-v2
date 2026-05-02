import { createElement } from "react";
import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";
import type { availableOrientations } from "../types";

const waitForRenderTick = async () => {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
};

const waitForProgressPaint = async () => {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
};

const yieldToBrowser = async () => {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      requestAnimationFrame(() => resolve());
    }, 0);
  });
};

const runWithSuppressedConsoleLogs = async <T>(
  task: () => Promise<T>,
): Promise<T> => {
  const originalLog = console.log;
  const originalDebug = console.debug;

  console.log = () => undefined;
  console.debug = () => undefined;

  try {
    return await task();
  } finally {
    console.log = originalLog;
    console.debug = originalDebug;
  }
};

const toPropsRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
};

const normalizePageProps = (props: unknown): Record<string, unknown>[] => {
  if (Array.isArray(props)) {
    if (props.length === 0) return [{}];
    return props.map((entry) => toPropsRecord(entry));
  }
  return [toPropsRecord(props)];
};

const reportProgress = async (
  progress: number,
  onProgress?: (progress: number) => void,
): Promise<number> => {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  onProgress?.(clampedProgress);
  await waitForProgressPaint();
  return clampedProgress;
};

export const renderComponentToPdfBlob = async (
  Component: ComponentType<{ orientation: availableOrientations }>,
  props: unknown,
  widthCm: number,
  heightCm: number,
  orientation: availableOrientations = "vertical",
  onProgress?: (progress: number) => void,
): Promise<Blob> => {
  if (typeof document === "undefined") {
    throw new Error("PDF rendering is only available in browser environments.");
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const shouldRotateTemplate =
    orientation === "horizontal" && widthCm < heightCm;
  const orientedWidthCm = shouldRotateTemplate ? heightCm : widthCm;
  const orientedHeightCm = shouldRotateTemplate ? widthCm : heightCm;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = `${orientedWidthCm}cm`;
  // Rotated templates use a fixed inner size before the CSS transform, so keep a
  // fixed container height. For all other templates allow the content to expand
  // beyond one page — the canvas will be sliced into A4 strips below.
  if (shouldRotateTemplate) {
    container.style.height = `${orientedHeightCm}cm`;
  } else {
    container.style.minHeight = `${orientedHeightCm}cm`;
    container.style.height = "auto";
  }
  container.style.background = "#fff";
  container.style.zIndex = "-1";
  container.style.pointerEvents = "none";
  container.style.boxSizing = "border-box";
  container.setAttribute("data-print-render-container", "true");

  document.body.appendChild(container);

  const root = createRoot(container);
  const pagePropsList = normalizePageProps(props);
  const totalPages = Math.max(1, pagePropsList.length);
  let reportedProgress = 0;

  try {
    reportedProgress = await reportProgress(0.05, onProgress);

    const pdf = new jsPDF({
      orientation:
        orientedWidthCm >= orientedHeightCm ? "landscape" : "portrait",
      unit: "cm",
      format: [orientedWidthCm, orientedHeightCm],
    });

    for (let index = 0; index < pagePropsList.length; index += 1) {
      await yieldToBrowser();

      const pageStartProgress = 0.08 + (index / totalPages) * 0.88;
      const pageEndProgress = 0.08 + ((index + 1) / totalPages) * 0.88;
      const resolvePageProgress = (fraction: number) =>
        pageStartProgress + (pageEndProgress - pageStartProgress) * fraction;
      const reportPageProgress = async (fraction: number) => {
        reportedProgress = await reportProgress(
          Math.max(reportedProgress, resolvePageProgress(fraction)),
          onProgress,
        );
      };

      await reportPageProgress(0.08);

      const pageProps = pagePropsList[index];
      const componentElement = createElement(Component, {
        ...pageProps,
        orientation,
      });

      const renderElement = shouldRotateTemplate
        ? createElement(
            "div",
            {
              style: {
                width: `${widthCm}cm`,
                height: `${heightCm}cm`,
                transform: "rotate(90deg) translateY(-100%)",
                transformOrigin: "top left",
              },
            },
            componentElement,
          )
        : componentElement;

      root.render(renderElement);
      await reportPageProgress(0.22);
      await waitForRenderTick();
      await reportPageProgress(0.34);
      await yieldToBrowser();
      await reportPageProgress(0.46);

      const containerRect = container.getBoundingClientRect();
      const breakBoundaries = Array.from(
        container.querySelectorAll<HTMLElement>("*"),
      )
        .map((element) => {
          const rect = element.getBoundingClientRect();
          if (rect.height <= 0) {
            return null;
          }

          return {
            top: rect.top - containerRect.top,
            bottom: rect.bottom - containerRect.top,
          };
        })
        .filter(
          (
            boundary,
          ): boundary is {
            top: number;
            bottom: number;
          } => boundary != null,
        );

      await reportPageProgress(0.56);
      const canvas = await runWithSuppressedConsoleLogs(() =>
        html2canvas(container, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
        }),
      );
      await reportPageProgress(0.76);

      const canvasScale = container.offsetWidth
        ? canvas.width / container.offsetWidth
        : 1;
      const pageHeightPx = Math.max(
        1,
        Math.round((canvas.width * orientedHeightCm) / orientedWidthCm),
      );
      const cuts = [0];
      let currentStart = 0;
      while (currentStart < canvas.height) {
        const idealCut = currentStart + pageHeightPx;
        if (idealCut >= canvas.height) break;

        let safeCut = idealCut;
        for (const { top, bottom } of breakBoundaries) {
          const elTop = top * canvasScale;
          const elBottom = bottom * canvasScale;
          // Element straddles the cut line and started on the current page.
          if (elTop > currentStart && elTop < idealCut && elBottom > idealCut) {
            safeCut = Math.min(safeCut, elTop);
          }
        }
        // Guard: if no progress can be made (element taller than a page), fall back.
        if (Math.round(safeCut) <= currentStart) safeCut = idealCut;

        cuts.push(Math.round(safeCut));
        currentStart = Math.round(safeCut);
      }
      cuts.push(canvas.height);

      await reportPageProgress(0.88);

      for (let slice = 0; slice < cuts.length - 1; slice++) {
        const srcY = cuts[slice] ?? 0;
        const srcHeight = (cuts[slice + 1] ?? canvas.height) - srcY;

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageHeightPx;
        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            srcY,
            canvas.width,
            srcHeight,
            0,
            0,
            canvas.width,
            srcHeight,
          );
        }

        if (index > 0 || slice > 0) {
          pdf.addPage(
            [orientedWidthCm, orientedHeightCm],
            orientedWidthCm >= orientedHeightCm ? "landscape" : "portrait",
          );
        }
        pdf.addImage(
          pageCanvas.toDataURL("image/png"),
          "PNG",
          0,
          0,
          orientedWidthCm,
          orientedHeightCm,
        );
      }

      await yieldToBrowser();
      await reportPageProgress(0.96);
    }

    reportedProgress = await reportProgress(1, onProgress);
    return pdf.output("blob");
  } finally {
    root.unmount();
    container.remove();
  }
};
