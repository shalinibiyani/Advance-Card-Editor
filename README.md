#  Advanced Card Editor

A modern, feature-rich design editor built with React, TypeScript, and Konva.js. Create beautiful designs with text, shapes, images, and icons on a fixed canvas with powerful editing capabilities.

## ✨ Features

### 🎨 Canvas & Elements

- **Fixed 600×350px canvas** for consistent design space
- **Text Elements**: Editable text with font size, bold/italic/underline, and color options
- **Shapes**: Rectangle, circle, and line elements
- **Images**: Upload, auto-fit, drag, and crop functionality
- **SVG Icons**: Select from Lucide-React icon library

### 🛠️ Element Management

- **Layer Panel**: Virtualized list with drag-to-reorder functionality
- **Properties Panel**: Live updates based on selected element type
- **Click Selection**: Click on sidebar elements to select them on canvas
- **Multi-Select**: Ctrl/Cmd + click for multiple element selection

### ⚡ Alignment & Snapping

- **Smart Snapping**: Snap to edges, center points, and equal spacing
- **Keyboard Navigation**: Arrow keys for 1px movement, Shift+Arrow for 10px
- **Visual Guides**: Dynamic snapping guides during element movement

### 🔄 Grouping & Transformation

- **Group/Ungroup**: Combine multiple elements into groups
- **Multi-Select**: Select multiple elements with Ctrl/Cmd + click
- **Transform Controls**: Move, resize, and rotate groups and individual elements

### ↩️ Undo/Redo

- **20-step History**: Complete undo/redo functionality using Zustand middleware
- **Keyboard Shortcuts**: Ctrl+Z (undo), Ctrl+Y/Ctrl+Shift+Z (redo)

### 📤 Export

- **High-Resolution PNG**: Export designs as PNG with configurable quality
- **PDF Export**: Generate PDF files from your designs
- **Clean Export**: Selection outlines and guides hidden during export

### 🎨 UI/UX

- **Figma-like Interface**: Clean, modern UI built with Tailwind CSS
- **Dark/Light Mode**: Toggle between themes with preference saved in localStorage
- **Smooth Animations**: Framer Motion for smooth selection and interactions
- **Responsive Design**: Optimized for different screen sizes

### 🚀 Performance

- **Optimized for 50+ Elements**: Efficient rendering for complex designs
- **React.memo + Zustand**: Optimized re-renders with selective state management
- **Virtualized Layer List**: Efficient rendering of large layer lists with react-window

## 🏗️ Project Structure

src/
├── components/
│ ├── Canvas/
│ │ ├── EditorCanvas.tsx # Main canvas with Konva Stage
│ │ ├── ElementText.tsx # Text element component
│ │ ├── ElementImage.tsx # Image element component
│ │ ├── ElementIcon.tsx # Icon element component
│ │ └── NodeTransformer.tsx # Selection transformer
│ ├── Sidebar/
│ │ ├── LayersPanel.tsx # Layer management
│ │ └── PropertiesPanel.tsx # Element properties
│ └── Toolbar/
│ └── Toolbar.tsx # Add elements and theme toggle
├── store/
│ └── useEditorStore.ts # Zustand state management
└── utils/
├── export.ts # PNG/PDF export functions
└── snapping.ts # Snapping and alignment logic

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
   git clone <repository-url>
   cd foldername

2. **Install dependencies**
   npm install
   or
   yarn install

3. **Start development server**
   npm run dev
    or
   yarn dev
