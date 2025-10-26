import React from "react"
import EditorCanvas from "./components/Canvas/EditorCanvas"
import LayersPanel from "./components/Sidebar/LayersPanel"
import PropertiesPanel from "./components/Sidebar/PropertiesPanel"
import Toolbar from "./components/Toolbar/Toolbar"
export default function App() {
  return (
    <div className='h-screen flex bg-slate-50 dark:bg-slate-900'>
      <aside className='w-72 p-4 border-r bg-white dark:bg-slate-800'>
        <Toolbar />
        <div className='mt-4'>
          <LayersPanel />
        </div>
      </aside>
      <main className='flex-1 flex items-center justify-center'>
        <div className='p-6 bg-gray-200 dark:bg-slate-700 rounded'>
          <EditorCanvas width={600} height={350} />
        </div>
      </main>
      <aside className='w-80 p-4 border-l bg-white dark:bg-slate-800'>
        <PropertiesPanel />
      </aside>
    </div>
  )
}
