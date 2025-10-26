import React, { useEffect, useRef, useState, useMemo } from "react";
import { Stage, Layer, Rect, Circle, Group } from "react-konva";
import Konva from "konva";
import NodeTransformer from "./NodeTransformer";
import ElementImage from "./ElementImage";
import ElementText from "./ElementText";
import ElementIcon from "./ElementIcon";
import { useEditorStore } from "../../store/useEditorStore";
import { computeSnap } from "../../utils/snapping";
import { exportPNG, exportPDF } from "../../utils/export";

type Props = { width: number; height: number };

export default function EditorCanvas({ width, height }: Props) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const nodeRefs = useRef<Record<string, Konva.Node | null>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const elements = useEditorStore((s) => s.elements);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const select = useEditorStore((s) => s.select);
  const toggleSelect = useEditorStore((s) => s.toggleSelect);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const updateElement = useEditorStore((s) => s.updateElement);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const deleteSelected = useEditorStore((s) => s.deleteSelected);
  const moveSelectedBy = useEditorStore((s) => s.moveSelectedBy);
  const groupSelected = useEditorStore((s) => s.groupSelected);
  const ungroup = useEditorStore((s) => s.ungroup);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  // marquee selection
  const [isBrushing, setIsBrushing] = useState(false);
  const brushStart = useRef<{ x: number; y: number } | null>(null);
  const [brushRect, setBrushRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // guides from snapping
  const [guides, setGuides] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);

  // text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [editingPosition, setEditingPosition] = useState({ x: 0, y: 0, width: 100, height: 30 });

  // compute candidate elements for snapping (top-level only)
  const candidates = useMemo(() => elements.filter((e) => e.type !== "group"), [elements]);

  // keyboard handlers: undo/redo/delete/arrows
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingTextId) {
        // Allow normal typing when editing text
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        e.preventDefault();
        redo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
      }
      const arrowKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
      if (arrowKeys.includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let dx = 0,
          dy = 0;
        if (e.key === "ArrowLeft") dx = -step;
        if (e.key === "ArrowRight") dx = step;
        if (e.key === "ArrowUp") dy = -step;
        if (e.key === "ArrowDown") dy = step;
        moveSelectedBy(dx, dy);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, deleteSelected, moveSelectedBy, editingTextId]);

  // selected nodes to attach transformer to
  const selectedNodes = selectedIds.map((id) => nodeRefs.current[id]).filter(Boolean) as Konva.Node[];

  // Focus textarea when editing starts
  useEffect(() => {
    if (editingTextId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingTextId]);

  // stage handlers for marquee selection
  const onStageMouseDown = (e: any) => {
    // Close text editor when clicking on stage
    if (editingTextId) {
      finishTextEditing();
    }
    
    // deselect if clicked on empty area
    if (e.target === e.target.getStage()) {
      clearSelection();
      setIsBrushing(true);
      const pos = e.target.getPointerPosition();
      brushStart.current = pos ? { x: pos.x, y: pos.y } : null;
      setBrushRect(null);
    }
  };

  const onStageMouseMove = (e: any) => {
    if (!isBrushing || !brushStart.current) return;
    const pos = e.target.getPointerPosition();
    if (!pos) return;
    const x = Math.min(brushStart.current.x, pos.x);
    const y = Math.min(brushStart.current.y, pos.y);
    const w = Math.abs(pos.x - brushStart.current.x);
    const h = Math.abs(pos.y - brushStart.current.y);
    setBrushRect({ x, y, w, h });
  };

  const onStageMouseUp = (e: any) => {
    if (!isBrushing) return;
    setIsBrushing(false);
    if (!brushRect) return;
    const sel: string[] = [];
    // pick top-level elements fully inside brush rect
    elements.forEach((el) => {
      // skip group children (group renders them)
      const parentGroup = elements.find((g) => g.type === "group" && g.children?.includes(el.id));
      if (parentGroup) return;
      const ex = el.x ?? 0;
      const ey = el.y ?? 0;
      const ew = el.width ?? 10;
      const eh = el.height ?? 10;
      if (ex >= brushRect.x && ey >= brushRect.y && ex + ew <= brushRect.x + brushRect.w && ey + eh <= brushRect.y + brushRect.h) {
        sel.push(el.id);
      }
    });
    if (sel.length) {
      sel.forEach((id, i) => {
        if (i === 0) select(id, false);
        else toggleSelect(id);
      });
    }
    setBrushRect(null);
    brushStart.current = null;
  };

  // global onDragMove handler (attached to each element individually in rendering)
  const onDragMoveCommon = (id: string, x: number, y: number, w = 0, h = 0) => {
    const others = candidates.filter((c) => c.id !== id);
    const snap = computeSnap(x, y, w, h, others);
    setGuides(snap.guides);
  };

  // Text editing functions
  const handleTextEditStart = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element?.type === 'text') {
      setEditingTextId(id);
      setEditingText(element.text || "");
      
      // Calculate position for textarea overlay
      const stage = stageRef.current;
      if (stage) {
        const containerRect = stage.container().getBoundingClientRect();
        const textNode = nodeRefs.current[id] as Konva.Text;
        if (textNode) {
          const absolutePos = textNode.absolutePosition();
          const textWidth = Math.max(textNode.width(), 100);
          const textHeight = Math.max(textNode.height(), 30);
          
          setEditingPosition({
            x: containerRect.left + absolutePos.x,
            y: containerRect.top + absolutePos.y,
            width: textWidth,
            height: textHeight
          });
        }
      }
    }
  };

  const finishTextEditing = () => {
    if (editingTextId && editingText.trim() !== '') {
      updateElement(editingTextId, { text: editingText });
      pushHistory();
    }
    setEditingTextId(null);
    setEditingText("");
  };

  const cancelTextEditing = () => {
    setEditingTextId(null);
    setEditingText("");
  };

  // Textarea keyboard handler
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Stop propagation to prevent editor shortcuts from interfering
    e.stopPropagation();
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finishTextEditing();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelTextEditing();
    }
    // Allow all other keys including backspace to work normally
  };

  // render functions
  const renderElement = (el: any) => {
    if (el.type === "group") {
      return (
        <Group
          key={el.id}
          id={el.id}
          x={el.x}
          y={el.y}
          rotation={el.rotation}
          draggable
          onClick={(ev) => {
            select(el.id);
            ev.cancelBubble = true;
          }}
          onDragEnd={(ev) => {
            pushHistory();
            updateElement(el.id, { x: ev.target.x(), y: ev.target.y() });
          }}
        >
          {el.children?.map((cid: string) => {
            const child = elements.find((e) => e.id === cid);
            if (!child) return null;
            if (child.type === "rect")
              return <Rect key={child.id} x={child.x} y={child.y} width={child.width} height={child.height} fill={child.fill} />;
            if (child.type === "circle")
              return <Circle key={child.id} x={child.x} y={child.y} radius={(child.width ?? 40) / 2} fill={child.fill} />;
            if (child.type === "text")
              return (
                <ElementText
                  key={child.id}
                  el={child}
                  ref={(n) => (nodeRefs.current[child.id] = n)}
                  onClick={() => select(el.id)}
                  onDblClick={() => handleTextEditStart(child.id)}
                />
              );
            if (child.type === "image") return <ElementImage key={child.id} el={child} nodeRefs={nodeRefs} updateElement={updateElement} />;
            if (child.type === "icon") return <ElementIcon key={child.id} el={child} nodeRefs={nodeRefs} />;
            return null;
          })}
        </Group>
      );
    }

    if (el.type === "rect") {
      return (
        <Rect
          key={el.id}
          id={el.id}
          ref={(n) => (nodeRefs.current[el.id] = n)}
          x={el.x}
          y={el.y}
          width={el.width}
          height={el.height}
          fill={el.fill}
          rotation={el.rotation}
          draggable
          onClick={(ev) => {
            if (ev.evt.shiftKey || ev.evt.metaKey || ev.evt.ctrlKey) toggleSelect(el.id);
            else select(el.id);
          }}
          onDragMove={(ev) => {
            const pos = ev.target.position();
            onDragMoveCommon(el.id, pos.x, pos.y, el.width ?? 0, el.height ?? 0);
          }}
          onDragEnd={(ev) => {
            const pos = ev.target.position();
            const snap = computeSnap(pos.x, pos.y, el.width ?? 0, el.height ?? 0, candidates);
            pushHistory();
            updateElement(el.id, { x: snap.x, y: snap.y });
            setGuides([]);
          }}
          onTransformEnd={(ev) => {
            const node = ev.target as any;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            pushHistory();
            updateElement(el.id, {
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY)
              // Removed scaleX and scaleY - they're Konva internal properties
            });
            node.scaleX(1);
            node.scaleY(1);
          }}
        />
      );
    }

    if (el.type === "circle") {
      return (
        <Circle
          key={el.id}
          id={el.id}
          ref={(n) => (nodeRefs.current[el.id] = n)}
          x={el.x}
          y={el.y}
          radius={(el.width ?? 40) / 2}
          fill={el.fill}
          rotation={el.rotation}
          draggable
          onClick={(ev) => {
            if (ev.evt.shiftKey || ev.evt.metaKey || ev.evt.ctrlKey) toggleSelect(el.id);
            else select(el.id);
          }}
          onDragMove={(ev) => {
            const pos = ev.target.position();
            onDragMoveCommon(el.id, pos.x, pos.y, el.width ?? 0, el.height ?? 0);
          }}
          onDragEnd={(ev) => {
            const pos = ev.target.position();
            const snap = computeSnap(pos.x, pos.y, el.width ?? 0, el.height ?? 0, candidates);
            pushHistory();
            updateElement(el.id, { x: snap.x, y: snap.y });
            setGuides([]);
          }}
        />
      );
    }

    if (el.type === "image") {
      return <ElementImage key={el.id} el={el} nodeRefs={nodeRefs} onSelect={() => select(el.id)} updateElement={updateElement} />;
    }

    if (el.type === "icon") {
      return <ElementIcon key={el.id} el={el} nodeRefs={nodeRefs} onSelect={() => select(el.id)} />;
    }

    // text
    return (
      <ElementText
        key={el.id}
        el={el}
        ref={(n) => (nodeRefs.current[el.id] = n)}
        onClick={() => select(el.id)}
        onDblClick={() => handleTextEditStart(el.id)}
      />
    );
  };

  // export handlers
  const handleExportPNG = () => {
    if (!stageRef.current) return;
    exportPNG(stageRef.current, "card.png", 2);
  };
  const handleExportPDF = () => {
    if (!stageRef.current) return;
    exportPDF(stageRef.current, width, height, "card.pdf");
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* Canvas Container */}
      <div className="relative mb-4">
        <Stage
          ref={(n) => (stageRef.current = n)}
          width={width}
          height={height}
          onMouseDown={onStageMouseDown}
          onMouseMove={onStageMouseMove}
          onMouseUp={onStageMouseUp}
          style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "8px" }}
        >
          <Layer>
            {/* card background */}
            <Rect x={0} y={0} width={width} height={height} fill="#fff" stroke="#e5e7eb" />

            {/* render each element (skip children of groups) */}
            {elements.map((el) => {
              const partOfGroup = elements.some((g) => g.type === "group" && g.children?.includes(el.id));
              if (partOfGroup) return null;
              return renderElement(el);
            })}

            {/* marquee rect */}
            {isBrushing && brushRect && <Rect x={brushRect.x} y={brushRect.y} width={brushRect.w} height={brushRect.h} fill="rgba(59,130,246,0.08)" stroke="#3b82f6" dash={[4, 4]} />}

            {/* draw guides */}
            {guides.map((g, i) => (
              <Rect key={i} x={Math.min(g.x1, g.x2)} y={Math.min(g.y1, g.y2)} width={Math.abs(g.x2 - g.x1) || 1} height={Math.abs(g.y2 - g.y1) || 1} fill="rgba(59,130,246,0.9)" />
            ))}

            {/* transformer attached to selected nodes */}
            <NodeTransformer nodes={selectedNodes} />
          </Layer>
        </Stage>
      </div>

      {/* Export and Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button 
          className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
          onClick={handleExportPNG}
        >
          Export PNG
        </button>
        <button 
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
          onClick={handleExportPDF}
        >
          Export PDF
        </button>
        <button 
          className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={() => groupSelected()}
          disabled={selectedIds.length < 2}
        >
          Group
        </button>
        <button 
          className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={() => ungroup(selectedIds[0] ?? "")}
          disabled={selectedIds.length !== 1}
        >
          Ungroup
        </button>
      </div>

      {/* Text Editing Overlay */}
      {editingTextId && (() => {
        const element = elements.find(el => el.id === editingTextId);
        if (!element || element.type !== 'text') return null;
        
        const style: React.CSSProperties = {
          position: 'fixed',
          left: editingPosition.x,
          top: editingPosition.y,
          zIndex: 1000,
          background: 'white',
          border: '2px solid #3b82f6',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: `${element.fontSize || 16}px`,
          fontFamily: 'Arial, sans-serif',
          fontStyle: element.fontStyle?.includes('italic') ? 'italic' : 'normal',
          fontWeight: element.fontStyle?.includes('bold') ? 'bold' : 'normal',
          color: element.fill || '#000000',
          minWidth: `${editingPosition.width}px`,
          minHeight: `${editingPosition.height}px`,
          resize: 'both',
          outline: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          lineHeight: '1.4',
        };

        return (
          <textarea
            ref={textareaRef}
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onBlur={finishTextEditing}
            onKeyDown={handleTextareaKeyDown}
            style={style}
            placeholder="Enter text..."
          />
        );
      })()}
    </div>
  );
}