
import React from 'react';
import { 
  Trash, Save, Download, ZoomIn, ZoomOut, 
  ChevronsLeft, RotateCcw, RotateCw, 
  Square, Circle, Diamond, PanelRight, Plus 
} from 'lucide-react';

interface ToolbarProps {
  onClear: () => void;
  onSave: () => void;
  onExport: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function Toolbar({
  onClear,
  onSave,
  onExport,
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: ToolbarProps) {
  return (
    <div className="diagram-toolbar">
      {/* Node actions */}
      <button
        onClick={onZoomIn}
        title="Zoom In"
        aria-label="Zoom In"
      >
        <ZoomIn size={18} />
      </button>
      <button
        onClick={onZoomOut}
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <ZoomOut size={18} />
      </button>
      <button
        onClick={onFitView}
        title="Fit View"
        aria-label="Fit View"
      >
        <ChevronsLeft size={18} />
      </button>
      
      <div className="diagram-toolbar-divider"></div>
      
      {/* History actions */}
      {onUndo && (
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
          aria-label="Undo"
          className={!canUndo ? 'opacity-50 cursor-not-allowed' : ''}
        >
          <RotateCcw size={18} />
        </button>
      )}
      
      {onRedo && (
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
          aria-label="Redo"
          className={!canRedo ? 'opacity-50 cursor-not-allowed' : ''}
        >
          <RotateCw size={18} />
        </button>
      )}
      
      {(onUndo || onRedo) && (
        <div className="diagram-toolbar-divider"></div>
      )}
      
      {/* Diagram actions */}
      <button
        onClick={onSave}
        title="Save Diagram"
        aria-label="Save Diagram"
      >
        <Save size={18} />
      </button>
      <button
        onClick={onExport}
        title="Export as Image"
        aria-label="Export as Image"
      >
        <Download size={18} />
      </button>
      <button
        onClick={onClear}
        title="Clear Diagram"
        aria-label="Clear Diagram"
      >
        <Trash size={18} />
      </button>
    </div>
  );
}

export default Toolbar;
