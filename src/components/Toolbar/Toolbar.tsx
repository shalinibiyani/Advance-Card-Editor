import React, { useEffect, useState } from "react";
import { useEditorStore } from "../../store/useEditorStore";

/**
 * Toolbar with add buttons and theme toggle (persisted to localStorage).
 */
export default function Toolbar() {
  const addElement = useEditorStore((s) => s.addElement);
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <div className="flex flex-col gap-3 p-4 w-64">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Add Elements</h3>
      
      {/* Text Button */}
      <button 
        className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-white font-medium border border-gray-200 dark:border-gray-600"
        onClick={() => addElement({ type: "text", text: "New text", x: 40, y: 40, fontSize: 22, fill: "#111827" })}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
        <span>Add Text</span>
      </button>

      {/* Rectangle Button */}
      <button 
        className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-white font-medium border border-gray-200 dark:border-gray-600"
        onClick={() => addElement({ type: "rect", x: 60, y: 60, width: 120, height: 80, fill: "#10b981" })}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
        </svg>
        <span>Add Rectangle</span>
      </button>

      {/* Circle Button */}
      <button 
        className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-white font-medium border border-gray-200 dark:border-gray-600"
        onClick={() => addElement({ type: "circle", x: 160, y: 80, width: 80, height: 80, fill: "#f59e0b" })}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} />
        </svg>
        <span>Add Circle</span>
      </button>

      {/* Image Button */}
      <label className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-white font-medium border border-gray-200 dark:border-gray-600 cursor-pointer">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="flex-1 text-left">Add Image</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              addElement({ type: "image", src: reader.result as string, x: 100, y: 100, width: 150, height: 100 });
            };
            reader.readAsDataURL(file);
          }}
        />
      </label>

      {/* Icon Button */}
      <button 
        className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-white font-medium border border-gray-200 dark:border-gray-600"
        onClick={() => addElement({ type: "icon", x: 220, y: 40, width: 36, height: 36, iconName: "star", fill: "#ef4444" })}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <span>Add Icon</span>
      </button>

      {/* Theme Toggle */}
      <div className="pt-4 border-t border-gray-300 dark:border-gray-600 mt-2">
        <button 
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-100 dark:bg-gray-700 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors text-gray-800 dark:text-white font-medium"
          onClick={() => setDark((d) => !d)}
        >
          {dark ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}