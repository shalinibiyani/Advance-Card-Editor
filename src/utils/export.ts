// export helpers: hide overlays and exporter functions
import jsPDF from "jspdf";

/**
 * Temporarily hides nodes having a given className on the Konva stage,
 * runs `cb()` and then restores visibility.
 */
export function hideOverlaysAndRun(stage: any, overlayClass: string, cb: () => void) {
  if (!stage) return cb();
  const overlays = stage.find(`.${overlayClass}`);
  overlays.forEach((n: any) => n.hide());
  stage.batchDraw();
  try {
    cb();
  } finally {
    overlays.forEach((n: any) => n.show());
    stage.batchDraw();
  }
}

export function exportPNG(stage: any, filename = "card.png", pixelRatio = 2) {
  hideOverlaysAndRun(stage, "overlay", () => {
    const uri = stage.toDataURL({ pixelRatio });
    const a = document.createElement("a");
    a.href = uri;
    a.download = filename;
    a.click();
  });
}

export function exportJPEG(stage: any, filename = "card.jpg", pixelRatio = 2, quality = 0.92) {
  hideOverlaysAndRun(stage, "overlay", () => {
    const uri = stage.toDataURL({ mimeType: "image/jpeg", pixelRatio, quality });
    const a = document.createElement("a");
    a.href = uri;
    a.download = filename;
    a.click();
  });
}

export function exportPDF(stage: any, width: number, height: number, filename = "card.pdf") {
  hideOverlaysAndRun(stage, "overlay", () => {
    const uri = stage.toDataURL({ pixelRatio: 2 });
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [width, height] });
    pdf.addImage(uri, "PNG", 0, 0, width, height);
    pdf.save(filename);
  });
}
