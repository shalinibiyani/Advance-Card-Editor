// Zustand store for editor state
// - snapshot history (undo/redo) up to MAX_HISTORY
// - multi-select, grouping, reorder, basic element CRUD
import create from "zustand";
import produce from "immer";

export type ElementType = "text" | "rect" | "circle" | "image" | "icon" | "group";

export type ElementBase = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation?: number;
  width?: number;
  height?: number;
  fill?: string;
  text?: string;
  fontSize?: number;
  fontStyle?: string; // e.g. "bold italic"
  underline?: boolean;
  src?: string; // image dataURL
  opacity?: number;
  iconName?: string;
  children?: string[]; // group children ids
};

type EditorState = {
  elements: ElementBase[];
  selectedIds: string[]; // multi-select
  history: ElementBase[][];
  future: ElementBase[][];
  MAX_HISTORY: number;

  // actions
  pushHistory: () => void;
  addElement: (partial: Partial<ElementBase> & { type: ElementType }) => void;
  updateElement: (id: string, patch: Partial<ElementBase>) => void;
  removeElement: (id: string) => void;

  select: (id: string | null, additive?: boolean) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  deleteSelected: () => void;

  // grouping
  groupSelected: () => void;
  ungroup: (groupId: string) => void;

  // reorder
  bringForward: (id: string) => void;
  sendBack: (id: string) => void;

  // movement and history
  moveSelectedBy: (dx: number, dy: number) => void;
  undo: () => void;
  redo: () => void;
};

const idGen = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useEditorStore = create<EditorState>((set, get) => ({
  elements: [],
  selectedIds: [],
  history: [],
  future: [],
  MAX_HISTORY: 20, // 20-step history

  // push whole-elements snapshot (simple snapshot history)
  pushHistory: () =>
    set(
      produce((s: EditorState) => {
        s.history.push(JSON.parse(JSON.stringify(s.elements)));
        if (s.history.length > s.MAX_HISTORY) s.history.shift();
        s.future = [];
      })
    ),

  addElement: (partial) =>
    set(
      produce((state: EditorState) => {
        const el: ElementBase = {
          id: idGen(),
          type: partial.type,
          x: partial.x ?? 50,
          y: partial.y ?? 50,
          rotation: partial.rotation ?? 0,
          width: partial.width,
          height: partial.height,
          fill: partial.fill ?? "#111827",
          text: partial.text,
          fontSize: partial.fontSize ?? 20,
          fontStyle: partial.fontStyle ?? "normal",
          underline: partial.underline ?? false,
          src: partial.src,
          opacity: partial.opacity ?? 1,
          iconName: partial.iconName,
          children: partial.children
        };
        state.history.push(JSON.parse(JSON.stringify(state.elements)));
        state.elements.push(el);
        state.selectedIds = [el.id];
        state.future = [];
      })
    ),

  updateElement: (id, patch) =>
    set(
      produce((state: EditorState) => {
        const idx = state.elements.findIndex((e) => e.id === id);
        if (idx === -1) return;
        state.history.push(JSON.parse(JSON.stringify(state.elements)));
        state.elements[idx] = { ...state.elements[idx], ...patch };
        state.future = [];
      })
    ),

  removeElement: (id) =>
    set(
      produce((state: EditorState) => {
        state.history.push(JSON.parse(JSON.stringify(state.elements)));
        state.elements = state.elements.filter((e) => e.id !== id);
        // remove references inside groups
        state.elements.forEach((el) => {
          if (el.type === "group" && el.children) {
            el.children = el.children.filter((c) => c !== id);
          }
        });
        state.selectedIds = state.selectedIds.filter((s) => s !== id);
        state.future = [];
      })
    ),

  select: (id, additive = false) =>
    set(
      produce((state: EditorState) => {
        if (id === null) {
          state.selectedIds = [];
          return;
        }
        if (additive) {
          if (!state.selectedIds.includes(id)) state.selectedIds.push(id);
        } else {
          state.selectedIds = [id];
        }
      })
    ),

  toggleSelect: (id) =>
    set(
      produce((state: EditorState) => {
        const i = state.selectedIds.indexOf(id);
        if (i === -1) state.selectedIds.push(id);
        else state.selectedIds.splice(i, 1);
      })
    ),

  clearSelection: () =>
    set(
      produce((state: EditorState) => {
        state.selectedIds = [];
      })
    ),

  deleteSelected: () =>
    set(
      produce((state: EditorState) => {
        if (state.selectedIds.length === 0) return;
        state.history.push(JSON.parse(JSON.stringify(state.elements)));
        state.elements = state.elements.filter((e) => !state.selectedIds.includes(e.id));
        // remove from groups
        state.elements.forEach((el) => {
          if (el.type === "group" && el.children) {
            el.children = el.children.filter((c) => !state.selectedIds.includes(c));
          }
        });
        state.selectedIds = [];
        state.future = [];
      })
    ),

  groupSelected: () =>
    set(
      produce((state: EditorState) => {
        const sel = state.selectedIds.slice();
        if (sel.length < 2) return;
        const children = state.elements.filter((e) => sel.includes(e.id));
        if (children.length === 0) return;
        const minX = Math.min(...children.map((c) => c.x));
        const minY = Math.min(...children.map((c) => c.y));
        const groupEl: ElementBase = {
          id: idGen(),
          type: "group",
          x: minX,
          y: minY,
          rotation: 0,
          children: children.map((c) => c.id)
        };
        // convert child coords to group-relative
        children.forEach((c) => {
          const idx = state.elements.findIndex((e) => e.id === c.id);
          if (idx !== -1) {
            state.elements[idx].x = state.elements[idx].x - (groupEl.x ?? 0);
            state.elements[idx].y = state.elements[idx].y - (groupEl.y ?? 0);
          }
        });
        state.history.push(JSON.parse(JSON.stringify(state.elements)));
        state.elements.push(groupEl);
        state.selectedIds = [groupEl.id];
        state.future = [];
      })
    ),

  ungroup: (groupId) =>
    set(
      produce((state: EditorState) => {
        const gIdx = state.elements.findIndex((e) => e.id === groupId && e.type === "group");
        if (gIdx === -1) return;
        const group = state.elements[gIdx];
        if (!group.children || group.children.length === 0) return;
        state.history.push(JSON.parse(JSON.stringify(state.elements)));
        // move children back to absolute coordinates
        group.children.forEach((cid) => {
          const idx = state.elements.findIndex((e) => e.id === cid);
          if (idx === -1) return;
          state.elements[idx].x = state.elements[idx].x + (group.x ?? 0);
          state.elements[idx].y = state.elements[idx].y + (group.y ?? 0);
        });
        state.elements.splice(gIdx, 1);
        state.selectedIds = [];
        state.future = [];
      })
    ),

  bringForward: (id) =>
    set(
      produce((state: EditorState) => {
        const i = state.elements.findIndex((e) => e.id === id);
        if (i === -1 || i === state.elements.length - 1) return;
        const [el] = state.elements.splice(i, 1);
        state.elements.splice(i + 1, 0, el);
      })
    ),

  sendBack: (id) =>
    set(
      produce((state: EditorState) => {
        const i = state.elements.findIndex((e) => e.id === id);
        if (i <= 0) return;
        const [el] = state.elements.splice(i, 1);
        state.elements.splice(0, 0, el);
      })
    ),

  moveSelectedBy: (dx, dy) =>
    set(
      produce((state: EditorState) => {
        if (state.selectedIds.length === 0) return;
        state.history.push(JSON.parse(JSON.stringify(state.elements)));
        state.selectedIds.forEach((id) => {
          const idx = state.elements.findIndex((e) => e.id === id);
          if (idx === -1) return;
          state.elements[idx].x = (state.elements[idx].x ?? 0) + dx;
          state.elements[idx].y = (state.elements[idx].y ?? 0) + dy;
        });
        state.future = [];
      })
    ),

  undo: () =>
    set(
      produce((state: EditorState) => {
        if (state.history.length === 0) return;
        const prev = state.history.pop()!;
        state.future.push(JSON.parse(JSON.stringify(state.elements)));
        state.elements = prev;
        state.selectedIds = [];
      })
    ),

  redo: () =>
    set(
      produce((state: EditorState) => {
        if (state.future.length === 0) return;
        const next = state.future.pop()!;
        state.history.push(JSON.parse(JSON.stringify(state.elements)));
        state.elements = next;
        state.selectedIds = [];
      })
    )
}));
