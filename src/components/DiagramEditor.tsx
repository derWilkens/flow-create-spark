
import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  useReactFlow,
  Panel,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import { toast } from 'sonner';

import '@xyflow/react/dist/style.css';

import { nodeTypes, TextUpdaterNode } from './NodeTypes';
import { edgeTypes } from './EdgeTypes';
import Toolbar from './Toolbar';
import NodeContextMenu from './NodeContextMenu';
import {
  createNode,
  addNewEdge,
  updateNodeData,
  deleteElements,
  downloadDiagramAsJson,
  exportDiagramAsImage,
  CustomNode,
  CustomEdge,
} from '../utils/diagramUtils';

// Local storage key for saving diagrams
const STORAGE_KEY = 'diagram-app-data';

export function DiagramEditor() {
  // React Flow hook for accessing instance methods
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // State for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode['data']>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge['data']>([]);
  
  // State for context menu
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string;
    position: { x: number; y: number };
  } | null>(null);
  
  // State to track if the diagram is empty
  const [isDiagramEmpty, setIsDiagramEmpty] = useState(true);
  
  // Update empty state when nodes change
  useEffect(() => {
    setIsDiagramEmpty(nodes.length === 0);
  }, [nodes]);
  
  // Load saved diagram from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedData);
        if (Array.isArray(savedNodes) && Array.isArray(savedEdges)) {
          setNodes(savedNodes);
          setEdges(savedEdges);
        }
      } catch (error) {
        console.error('Failed to load saved diagram:', error);
      }
    }
  }, [setNodes, setEdges]);
  
  // Handle connecting nodes
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(prevEdges => addNewEdge(params, prevEdges));
    },
    [setEdges]
  );
  
  // Handle node label change
  const onNodeLabelChange = useCallback(
    (nodeId: string, label: string) => {
      setNodes(prevNodes =>
        prevNodes.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );
  
  // Handle double click to add node
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      // Only add node on double-click
      if (event.detail !== 2) return;
      
      if (!reactFlowWrapper.current || !reactFlowInstance) return;
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      const newNode = createNode(position);
      
      // Add the onLabelChange callback to the node data
      newNode.data.onLabelChange = (newLabel: string) => {
        onNodeLabelChange(newNode.id, newLabel);
      };
      
      setNodes(prevNodes => prevNodes.concat(newNode));
      
      // Show toast for adding node
      toast.success("Node added", {
        description: "Double-click on the node to edit text",
        duration: 3000,
      });
    },
    [reactFlowInstance, setNodes, onNodeLabelChange]
  );
  
  // Handle node context menu
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Prevent default context menu
      event.preventDefault();
      
      setContextMenu({
        nodeId: node.id,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    []
  );
  
  // Handle pane click (for closing context menu)
  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    // Always prevent default context menu
    event.preventDefault();
    
    // Close context menu if open
    setContextMenu(null);
  }, []);
  
  // Handle node deletion
  const onDeleteNode = useCallback(
    (nodeId: string) => {
      // Use our utility to delete node and connected edges
      const { nodes: updatedNodes, edges: updatedEdges } = deleteElements(
        nodes,
        edges,
        [nodeId],
        []
      );
      
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      
      // Show toast for deleting node
      toast.info("Node deleted");
    },
    [nodes, edges, setNodes, setEdges]
  );
  
  // Handle node editing
  const onEditNode = useCallback(
    (nodeId: string) => {
      // Find the node
      const nodeToEdit = nodes.find(node => node.id === nodeId);
      if (!nodeToEdit) return;
      
      // Simply trigger the node data's onLabelChange with its current label
      // This is a trick to get the node to enter edit mode
      if (nodeToEdit.data.onLabelChange) {
        nodeToEdit.data.onLabelChange(nodeToEdit.data.label);
      }
    },
    [nodes]
  );
  
  // Handle node duplication
  const onDuplicateNode = useCallback(
    (nodeId: string) => {
      // Find the node to duplicate
      const nodeToDuplicate = nodes.find(node => node.id === nodeId);
      if (!nodeToDuplicate) return;
      
      // Create a new position slightly offset from the original
      const newPosition = {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      };
      
      // Create a new node with the same type and data
      const newNode = createNode(newPosition, nodeToDuplicate.type);
      newNode.data = { ...nodeToDuplicate.data };
      
      // Add the onLabelChange callback to the new node data
      newNode.data.onLabelChange = (newLabel: string) => {
        onNodeLabelChange(newNode.id, newLabel);
      };
      
      setNodes(prevNodes => prevNodes.concat(newNode));
      
      // Show toast for duplicating node
      toast.success("Node duplicated");
    },
    [nodes, setNodes, onNodeLabelChange]
  );
  
  // Handle edge deletion
  const onDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges(prevEdges => prevEdges.filter(edge => edge.id !== edgeId));
      
      // Show toast for deleting edge
      toast.info("Connection removed");
    },
    [setEdges]
  );
  
  // Clear the entire diagram
  const onClearDiagram = useCallback(() => {
    if (nodes.length === 0) return;
    
    // Ask for confirmation
    if (window.confirm('Are you sure you want to clear the diagram? This action cannot be undone.')) {
      setNodes([]);
      setEdges([]);
      toast.info("Diagram cleared");
    }
  }, [nodes.length, setNodes, setEdges]);
  
  // Save diagram to local storage
  const onSaveDiagram = useCallback(() => {
    const diagramData = { nodes, edges };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(diagramData));
    toast.success("Diagram saved to browser storage");
  }, [nodes, edges]);
  
  // Export diagram as JSON file
  const onExportDiagram = useCallback(() => {
    exportDiagramAsImage(reactFlowInstance)
      .then(() => {
        toast.success("Diagram exported as image");
      })
      .catch(error => {
        console.error("Failed to export diagram:", error);
        toast.error("Failed to export diagram");
      });
  }, [reactFlowInstance]);
  
  // Zoom controls
  const onZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn({ duration: 300 });
  }, [reactFlowInstance]);
  
  const onZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut({ duration: 300 });
  }, [reactFlowInstance]);
  
  const onFitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
  }, [reactFlowInstance]);
  
  // Prepare edge data with onDelete callback
  const edgesWithDeleteCallback = edges.map(edge => ({
    ...edge,
    data: {
      ...edge.data,
      onDelete: onDeleteEdge,
    },
  }));
  
  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edgesWithDeleteCallback}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
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
            <p className="text-sm">Connect nodes by dragging from one handle to another</p>
          </div>
        )}
      </ReactFlow>
      
      {contextMenu && (
        <NodeContextMenu
          nodeId={contextMenu.nodeId}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onDelete={onDeleteNode}
          onEdit={onEditNode}
          onDuplicate={onDuplicateNode}
        />
      )}
    </div>
  );
}

export default DiagramEditor;
