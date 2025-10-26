import React, { forwardRef } from "react";
import { Path } from "react-konva";
import Konva from "konva";
import { ElementBase } from "../../store/useEditorStore";

/**
 * Small icon component using SVG path. ForwardRef required for Transformer.
 */
const ICON_PATHS: Record<string, string> = {
  star: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z",
  heart: "M12 21s-6.716-4.35-9-6.5C-1 11.5 3 6 6 6c1.6 0 3 .9 3.95 2.36L12 11l2.05-2.64C16 6.9 17.4 6 19 6c3 0 7 5.5 3 8.5C18.716 16.65 12 21 12 21z"
};

const ElementIcon = forwardRef<Konva.Path | null, { el: ElementBase; nodeRefs?: React.MutableRefObject<Record<string, Konva.Node | null>>; onSelect?: () => void }>(
  ({ el, nodeRefs, onSelect }, ref) => {
    const path = ICON_PATHS[el.iconName ?? "star"] ?? ICON_PATHS["star"];
    return (
      <Path
        id={el.id}
        ref={(node) => {
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<Konva.Path | null>).current = node ?? null;
          if (nodeRefs) nodeRefs.current[el.id] = node ?? null;
        }}
        x={el.x}
        y={el.y}
        data={path}
        scaleX={(el.width ?? 24) / 24}
        scaleY={(el.height ?? 24) / 24}
        fill={el.fill ?? "#111"}
        draggable
        onClick={() => onSelect && onSelect()}
        onTap={() => onSelect && onSelect()}
      />
    );
  }
);
ElementIcon.displayName = "ElementIcon";
export default ElementIcon;
