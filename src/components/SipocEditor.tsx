import React, { useMemo, useRef, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import { toast } from 'sonner';

import '@xyflow/react/dist/style.css';

import { nodeTypes as customNodeTypes } from './NodeTypes';
import { edgeTypes as customEdgeTypes } from './EdgeTypes';
import Toolbar from './Toolbar';
import { useDiagramState } from '../hooks/useDiagramState';
import { ViewType } from '../hooks/useViewState';
import { useDiagramControls } from '../hooks/useDiagramControls';
import { ContextMenuManager } from './diagram/ContextMenuManager';
import { createNode, CustomNode } from '../utils/diagramUtils';
import { LibraryElement } from '../utils/elementLibraryUtils';

// Define the SIPOC column types
export type SipocColumnType = 'supplier' | 'input' | 'process' | 'output' | 'customer';

// Define the column configuration
const SIPOC_COLUMNS: { type: SipocColumnType; title: string; color: string }[] = [
  { type: 'supplier', title: 'Supplier', color: '#e9f5e9' },
  { type: 'input', title: 'Input', color: '#e3f2fd' },
  { type: 'process', title: 'Process', color: '#fff3e0' },
  { type: 'output', title: 'Output', color: '#f3e5f5' },
  { type: 'customer', title: 'Customer', color: '#fbe9e7' },
];

// Calculate column width based on the number of columns
const COLUMN_WIDTH_PERCENT = 100 / SIPOC_COLUMNS.length;

// Props-Definition für SipocEditor
interface SipocEditorProps {
  viewType?: ViewType;
  draggedElement?: LibraryElement | null;
}

export function SipocEditor({ viewType = 'sipoc', draggedElement = null }: SipocEditorProps) {
  // Get diagram state and operations from our custom hook with the SIPOC view type
  const {
    nodes,
    edges, 
    isDiagramEmpty,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeLabelChange,
    onDeleteNode,
    onEditNode,
    onDuplicateNode,
    onDeleteEdge,
    onClearDiagram,
    onSaveDiagram,
    setNodes,
    setEdges,
    reactFlowInstance
  } = useDiagramState(viewType);
  
  // Get diagram UI controls
  const {
    onZoomIn,
    onZoomOut,
    onFitView,
    onExportDiagram
  } = useDiagramControls(reactFlowInstance);
  
  // Get context menu functionality
  const {
    contextMenuComponent,
    onNodeContextMenu,
    onPaneContextMenu
  } = ContextMenuManager({
    onDeleteNode,
    onEditNode,
    onDuplicateNode
  });
  
  // Reference to the ReactFlow wrapper div
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Get the ReactFlow instance
  const { screenToFlowPosition } = useReactFlow();
  
  // Handle double click to add node in a specific column
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      // Only add node on double-click
      if (event.detail !== 2) return;
      
      if (!reactFlowWrapper.current || !reactFlowInstance) return;
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      // Determine which column was clicked
      const columnWidth = reactFlowBounds.width / SIPOC_COLUMNS.length;
      const clickX = event.clientX - reactFlowBounds.left;
      const columnIndex = Math.floor(clickX / columnWidth);
      const columnType = SIPOC_COLUMNS[columnIndex].type;
      
      // Create a new node with the appropriate type
      const newNode = createNode(position, 'textUpdater');
      
      // Set the node type based on the column
      newNode.data = {
        ...newNode.data,
        label: `New ${columnType}`,
        nodeType: columnType,
      };
      
      // Add the onLabelChange callback to the node data
      newNode.data.onLabelChange = (newLabel: string) => {
        onNodeLabelChange(newNode.id, newLabel);
      };
      
      // Center the node horizontally in its column
      const columnCenter = (columnIndex * columnWidth) + (columnWidth / 2);
      newNode.position.x = screenToFlowPosition({ x: columnCenter, y: 0 }).x;
      
      setNodes((prevNodes) => [...prevNodes, newNode]);
      
      // Show toast for adding node
      toast.success(`${columnType.charAt(0).toUpperCase() + columnType.slice(1)} node added`, {
        description: "Double-click on the node to edit text",
        duration: 3000,
      });
    },
    [reactFlowInstance, setNodes, onNodeLabelChange, screenToFlowPosition]
  );
  
  // Funktion zum Behandeln des Drop-Events für Bibliothekselemente
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      // Prüfen, ob Daten vorhanden sind
      const elementData = event.dataTransfer.getData('application/reactflow');
      if (!elementData) return;

      try {
        // Bibliothekselement aus den übertragenen Daten extrahieren
        const element = JSON.parse(elementData) as LibraryElement;

        // Position berechnen, wo das Element fallen gelassen wurde
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const dropPosition = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };
        
        // Bestimme, in welche Spalte das Element fallen gelassen wurde
        const columnWidth = reactFlowBounds.width / SIPOC_COLUMNS.length;
        const columnIndex = Math.floor(dropPosition.x / columnWidth);
        const columnType = SIPOC_COLUMNS[columnIndex].type;
        
        // Überprüfe, ob das Element-Typ mit der Spalte übereinstimmt
        if (element.type !== columnType && element.type !== 'generic') {
          toast.warning(`${element.name} kann nicht in die ${SIPOC_COLUMNS[columnIndex].title}-Spalte gezogen werden`);
          return;
        }
        
        // Position in Flow-Koordinaten umrechnen
        const position = reactFlowInstance.screenToFlowPosition(dropPosition);
        
        // Neues Node erstellen basierend auf dem Bibliothekselement
        const newNode = createNode(position, 'textUpdater');
        
        // Node-Daten mit Bibliothekselement-Informationen füllen
        newNode.data = {
          ...newNode.data,
          label: element.name,
          nodeType: columnType, // Verwende Spaltentyp, um sicherzustellen, dass es passt
          description: element.description,
          libraryElementId: element.id, // Referenz zum Original speichern
        };

        // Zentriere den Knoten horizontal in seiner Spalte
        const columnCenter = (columnIndex * columnWidth) + (columnWidth / 2);
        newNode.position.x = reactFlowInstance.screenToFlowPosition({ x: columnCenter, y: 0 }).x;
        
        // onLabelChange-Callback hinzufügen
        newNode.data.onLabelChange = (newLabel: string) => {
          onNodeLabelChange(newNode.id, newLabel);
        };

        // Node zur Diagramm-State hinzufügen
        setNodes((prevNodes) => [...prevNodes, newNode]);

        // Feedback für den Benutzer
        toast.success(`Element "${element.name}" hinzugefügt`);
      } catch (error) {
        console.error('Fehler beim Hinzufügen des Elements:', error);
        toast.error('Element konnte nicht hinzugefügt werden');
      }
    },
    [reactFlowInstance, setNodes, onNodeLabelChange]
  );

  // Drag-Over-Handler für drop-Funktionalität
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  // Memoize node and edge types to avoid recreation on every render
  const memoizedNodeTypes = useMemo(() => customNodeTypes, []);
  const memoizedEdgeTypes = useMemo(() => customEdgeTypes, []);
  
  // Prepare edge data with onDelete callback
  const edgesWithDeleteCallback = useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      data: {
        ...(edge.data || {}),
        onDelete: onDeleteEdge,
      },
    }));
  }, [edges, onDeleteEdge]);
  
  return (
    <div className="w-full h-full" ref={reactFlowWrapper} onDrop={onDrop} onDragOver={onDragOver}>
      {/* SIPOC Column Headers */}
      <div className="absolute top-0 left-0 right-0 z-10 flex h-12 border-b border-gray-200 bg-white">
        {SIPOC_COLUMNS.map((column, index) => (
          <div 
            key={column.type}
            className="flex items-center justify-center font-medium border-r last:border-r-0 border-gray-200"
            style={{ 
              width: `${COLUMN_WIDTH_PERCENT}%`, 
              backgroundColor: column.color 
            }}
          >
            {column.title}
          </div>
        ))}
      </div>
      
      {/* SIPOC Column Backgrounds */}
      <div className="absolute top-12 left-0 right-0 bottom-0 z-0 flex pointer-events-none">
        {SIPOC_COLUMNS.map((column, index) => (
          <div 
            key={column.type}
            style={{ 
              width: `${COLUMN_WIDTH_PERCENT}%`, 
              backgroundColor: column.color,
              opacity: 0.2
            }}
          />
        ))}
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edgesWithDeleteCallback}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        nodeTypes={memoizedNodeTypes}
        edgeTypes={memoizedEdgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        deleteKeyCode="Delete"
        className="pt-12" // Add padding to account for the column headers
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={16} 
          size={1} 
          color="#e2e8f0" 
        />
        <Controls showInteractive={false} />
        <MiniMap 
          className="minimap" 
          zoomable 
          pannable 
          nodeColor="#3b82f6" 
        />
        
        <Panel position="top-center" className="z-10 mt-16">
          <Toolbar
            onClear={onClearDiagram}
            onSave={onSaveDiagram}
            onExport={onExportDiagram}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onFitView={onFitView}
          />
        </Panel>
        
        {isDiagramEmpty && (
          <div className="intro-message">
            <p className="text-lg mb-2">Double-click in a column to add a node</p>
            <p className="text-sm">Or drag elements from the library into the appropriate column</p>
          </div>
        )}
      </ReactFlow>
      
      {contextMenuComponent}
    </div>
  );
}

export default SipocEditor;
