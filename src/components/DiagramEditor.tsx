
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
import { useNodeCreator } from './diagram/NodeCreator';
import { LibraryElement } from '../utils/elementLibraryUtils';
import { createNode } from '../utils/diagramUtils';

// Props-Definition für DiagramEditor
interface DiagramEditorProps {
  viewType?: ViewType;
  draggedElement?: LibraryElement | null;
}

export function DiagramEditor({ viewType = 'flow', draggedElement = null }: DiagramEditorProps) {
  // Get diagram state and operations from our custom hook with the current view type
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
  
  // Get node creation functionality
  const { onPaneClick, reactFlowWrapper } = useNodeCreator(
    reactFlowInstance,
    onNodeLabelChange,
    setNodes
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
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        // Neues Node erstellen basierend auf dem Bibliothekselement
        const newNode = createNode(position, 'textUpdater');
        
        // Node-Daten mit Bibliothekselement-Informationen füllen
        newNode.data = {
          ...newNode.data,
          label: element.name,
          nodeType: element.type,
          description: element.description,
          libraryElementId: element.id, // Referenz zum Original speichern
        };

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
        
        <Panel position="top-center" className="z-10 mt-4">
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
            <p className="text-lg mb-2">Double-click anywhere to add a node</p>
            <p className="text-sm">Or drag elements from the library</p>
          </div>
        )}
      </ReactFlow>
      
      {contextMenuComponent}
    </div>
  );
}

export default DiagramEditor;
