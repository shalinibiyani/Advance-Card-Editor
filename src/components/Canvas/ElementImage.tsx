import React, { forwardRef, useEffect, useRef } from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { ElementBase } from "../../store/useEditorStore";

/**
 * ForwardRef Image so Transformer can attach.
 * Auto-fits natural image to a maximum size if width/height not provided.
 * Optionally calls updateElement (passed via props) to persist computed size.
 */
type Props = {
  el: ElementBase;
  nodeRefs?: React.MutableRefObject<Record<string, Konva.Node | null>>;
  onSelect?: () => void;
  updateElement?: (id: string, patch: Partial<ElementBase>) => void;
};

const ElementImage = forwardRef<Konva.Image | null, Props>(({ el, nodeRefs, onSelect, updateElement }, ref) => {
  const [img] = useImage(el.src || "");
  const localRef = useRef<Konva.Image | null>(null);

  useEffect(() => {
    // if image loaded and no width/height set, compute auto-fit and update
    if (img && (el.width === undefined || el.height === undefined)) {
      const maxW = 400;
      const maxH = 300;
      let w = img.width;
      let h = img.height;
      const ratio = Math.min(maxW / w, maxH / h, 1);
      w = w * ratio;
      h = h * ratio;
      if (localRef.current) {
        localRef.current.width(w);
        localRef.current.height(h);
      }
      if (updateElement) {
        updateElement(el.id, { width: Math.round(w), height: Math.round(h) });
      }
    }
  }, [img]);

  return (
    <KonvaImage
      id={el.id}
      ref={(node) => {
        // allow both forwarded ref and nodeRefs mapping
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<Konva.Image | null>).current = node ?? null;
        localRef.current = node ?? null;
        if (nodeRefs) nodeRefs.current[el.id] = node ?? null;
      }}
      x={el.x}
      y={el.y}
      image={img}
      width={el.width}
      height={el.height}
      draggable
      onClick={() => onSelect && onSelect()}
      onTap={() => onSelect && onSelect()}
      opacity={el.opacity ?? 1}
    />
  );
});
ElementImage.displayName = "ElementImage";
export default ElementImage;
