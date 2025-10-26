import React, { useEffect, useRef } from "react";
import { Transformer as KonvaTransformer } from "react-konva";
import Konva from "konva";

/**
 * Attach a Konva.Transformer to one or multiple nodes.
 * nodes prop is an array of Konva.Node instances (not refs).
 */
export default function NodeTransformer({ nodes }: { nodes: Konva.Node[] }) {
  const trRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    tr.nodes(nodes);
    tr.getLayer()?.batchDraw();
  }, [nodes]);

  return (
    <KonvaTransformer
      ref={trRef}
      rotateEnabled
      anchorSize={8}
      borderEnabled
      anchorStrokeWidth={1}
      anchorCornerRadius={2}
      enabledAnchors={[
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
        "middle-left",
        "middle-right",
        "top-center",
        "bottom-center"
      ]}
      // mark this transformer as overlay so we can hide during export
      className="overlay"
    />
  );
}
