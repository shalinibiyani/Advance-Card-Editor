import React from "react";
import { FixedSizeList as List } from "react-window";
import { useEditorStore } from "../../store/useEditorStore";

/**
 * Virtualized layers list with simple reorder (bring forward / send back).
 * For drag-to-reorder you can replace these buttons with a dnd library.
 */
export default function LayersPanel() {
  const elements = useEditorStore((s) => s.elements);
  const select = useEditorStore((s) => s.select);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBack = useEditorStore((s) => s.sendBack);

  const Row = ({ index, style }: { index: number; style: any }) => {
    const el = elements[index];
    return (
      <div style={style} className={`p-2 flex items-center justify-between gap-2`}>
        <div className={`flex-1 cursor-pointer ${selectedIds.includes(el.id) ? "bg-slate-200" : ""}`} onClick={() => select(el.id)}>
          <div className="text-sm">{el.type}</div>
          <div className="text-xs text-slate-500">#{el.id.slice(0, 6)}</div>
        </div>

        <div className="flex gap-1">
          <button className="px-2 py-1 bg-slate-100 text-xs rounded" onClick={() => bringForward(el.id)}>
            ↑
          </button>
          <button className="px-2 py-1 bg-slate-100 text-xs rounded" onClick={() => sendBack(el.id)}>
            ↓
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h4 className="font-semibold mb-2">Layers</h4>
      <div style={{ height: 360 }}>
        <List height={360} itemCount={elements.length} itemSize={56} width={"100%"}>
          {Row}
        </List>
      </div>
    </div>
  );
}
