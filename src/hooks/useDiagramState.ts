
import { useState, useCallback, useEffect } from 'react';
import { Node, Edge, useNodesState, useEdgesState, Connection, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { createNode, addNewEdge, deleteElements, CustomNode, CustomEdge } from '../utils/diagramUtils';

// Local storage key for saving diagrams
const STORAGE_KEY = 'diagram-app-data';

export function useDiagramState() {
  // React Flow hook for accessing instance methods
  const reactFlowInstance = useReactFlow();
  
  // State for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode["data"]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge["data"]>([]);
  
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
  
  // Handle connecting nodes
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(prevEdges => addNewEdge(params, prevEdges));
    },
    [setEdges]
  );

  // Handle node deletion
  const onDeleteNode = useCallback(
    (nodeId: string) => {
      // Use our utility to delete node and connected edges
      const { nodes: updatedNodes, edges: updatedEdges } = deleteElements(
        nodes as Node[],
        edges as Edge[],
        [nodeId],
        []
      );
      
      setNodes(updatedNodes as any);
      setEdges(updatedEdges as any);
      
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
      if (nodeToEdit.data && nodeToEdit.data.onLabelChange) {
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
      if (newNode.data) {
        newNode.data.onLabelChange = (newLabel: string) => {
          onNodeLabelChange(newNode.id, newLabel);
        };
      }
      
      setNodes(prevNodes => [...prevNodes, newNode]);
      
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

  return {
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
  };
}
