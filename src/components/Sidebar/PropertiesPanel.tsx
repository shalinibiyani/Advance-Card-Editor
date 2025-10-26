import React from "react";
import { useEditorStore } from "../../store/useEditorStore";

/**
 * Dynamic properties panel:
 * - For text: text, font size, bold/italic toggles, color
 * - For image: replace file input, opacity
 * - For shapes: fill color
 *
 * Live updates call updateElement directly.
 */
export default function PropertiesPanel() {
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const el = useEditorStore((s) => s.elements.find((x) => x.id === selectedIds[0]));
  const update = useEditorStore((s) => s.updateElement);
  const remove = useEditorStore((s) => s.removeElement);

  // Check if dark mode is enabled
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    // Check localStorage for theme preference
    const theme = localStorage.getItem('theme');
    const isDark = theme === 'dark' || 
                  (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Label styles for dark/light mode
  const labelStyle = `block text-xs ${isDarkMode ? 'text-white' : 'text-gray-700'}`;
  const inputStyle = `w-full p-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`;
  const buttonStyle = `px-2 py-1 rounded ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-slate-100 hover:bg-slate-200'}`;
  const deleteButtonStyle = `px-3 py-2 rounded text-white ${isDarkMode ? 'bg-red-600 hover:bg-red-500' : 'bg-red-500 hover:bg-red-400'}`;

  if (!el) {
    return (
      <div className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Properties</h4>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Select an element to edit properties</p>
      </div>
    );
  }

  return (
    <div className={`p-4 h-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Properties</h4>
      <div className="space-y-4">
        <div>
          <label className={labelStyle}>X Position</label>
          <input 
            type="number" 
            value={Math.round(el.x)} 
            onChange={(e) => update(el.id, { x: Number(e.target.value) })} 
            className={inputStyle}
          />
        </div>

        <div>
          <label className={labelStyle}>Y Position</label>
          <input 
            type="number" 
            value={Math.round(el.y)} 
            onChange={(e) => update(el.id, { y: Number(e.target.value) })} 
            className={inputStyle}
          />
        </div>

        {el.type === "text" && (
          <>
            <div>
              <label className={labelStyle}>Text Content</label>
              <input 
                type="text" 
                value={el.text} 
                onChange={(e) => update(el.id, { text: e.target.value })} 
                className={inputStyle}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className={labelStyle}>Font Size</label>
                <input 
                  type="number" 
                  value={el.fontSize} 
                  onChange={(e) => update(el.id, { fontSize: Number(e.target.value) })} 
                  className={inputStyle}
                />
              </div>

              <div className="flex-1">
                <label className={labelStyle}>Text Style</label>
                <div className="flex gap-1 mt-1">
                  <button 
                    className={`${buttonStyle} font-bold ${el.fontStyle?.includes("bold") ? (isDarkMode ? 'bg-blue-600' : 'bg-blue-500 text-white') : ''}`}
                    onClick={() => update(el.id, { 
                      fontStyle: el.fontStyle?.includes("bold") 
                        ? el.fontStyle.replace("bold", "").trim()
                        : (el.fontStyle ? `${el.fontStyle} bold` : "bold")
                    })}
                  >
                    B
                  </button>
                  <button 
                    className={`${buttonStyle} italic ${el.fontStyle?.includes("italic") ? (isDarkMode ? 'bg-blue-600' : 'bg-blue-500 text-white') : ''}`}
                    onClick={() => update(el.id, { 
                      fontStyle: el.fontStyle?.includes("italic") 
                        ? el.fontStyle.replace("italic", "").trim()
                        : (el.fontStyle ? `${el.fontStyle} italic` : "italic")
                    })}
                  >
                    I
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className={labelStyle}>Text Color</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={el.fill || "#000000"} 
                  onChange={(e) => update(el.id, { fill: e.target.value })} 
                  className="w-10 h-8 p-1 border rounded cursor-pointer"
                />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{el.fill}</span>
              </div>
            </div>
          </>
        )}

        {el.type === "image" && (
          <>
            <div>
              <label className={labelStyle}>Replace Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => update(el.id, { src: reader.result as string });
                  reader.readAsDataURL(file);
                }}
                className={`w-full p-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white' : 'file:bg-gray-100'}`}
              />
            </div>

            <div>
              <label className={labelStyle}>Opacity: {(el.opacity ?? 1) * 100}%</label>
              <input 
                type="range" 
                min={0} 
                max={1} 
                step={0.05} 
                value={el.opacity ?? 1} 
                onChange={(e) => update(el.id, { opacity: Number(e.target.value) })} 
                className="w-full"
              />
            </div>
          </>
        )}

        {(el.type === "shape" || el.type === "rectangle" || el.type === "circle") && (
          <div>
            <label className={labelStyle}>Fill Color</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={el.fill || "#000000"} 
                onChange={(e) => update(el.id, { fill: e.target.value })} 
                className="w-10 h-8 p-1 border rounded cursor-pointer"
              />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{el.fill}</span>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
          <button 
            className={deleteButtonStyle}
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this element?')) {
                remove(el.id);
              }
            }}
          >
            Delete Element
          </button>
        </div>
      </div>
    </div>
  );
}