
import { useCallback, useRef } from 'react';
import { Node } from '@xyflow/react';
import { toast } from 'sonner';
import { createNode, NodeData, CustomNode } from '../../utils/diagramUtils';

export function useNodeCreator(
  reactFlowInstance: any, 
  onNodeLabelChange: (nodeId: string, label: string) => void, 
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>
) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
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
      
      setNodes((prevNodes) => [...prevNodes, newNode]);
      
      // Show toast for adding node
      toast.success("Node added", {
        description: "Double-click on the node to edit text",
        duration: 3000,
      });
    },
    [reactFlowInstance, setNodes, onNodeLabelChange]
  );

  return {
    onPaneClick,
    reactFlowWrapper
  };
}
