
import React, { useState, useCallback } from 'react';
import { Node } from '@xyflow/react';
import NodeContextMenu from '../NodeContextMenu';

interface ContextMenuManagerProps {
  onDeleteNode: (nodeId: string) => void;
  onEditNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
}

export function ContextMenuManager({
  onDeleteNode,
  onEditNode,
  onDuplicateNode
}: ContextMenuManagerProps) {
  // State for context menu
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string;
    position: { x: number; y: number };
  } | null>(null);
  
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
  
  return {
    contextMenu,
    onNodeContextMenu,
    onPaneContextMenu,
    contextMenuComponent: contextMenu ? (
      <NodeContextMenu
        nodeId={contextMenu.nodeId}
        position={contextMenu.position}
        onClose={() => setContextMenu(null)}
        onDelete={onDeleteNode}
        onEdit={onEditNode}
        onDuplicate={onDuplicateNode}
      />
    ) : null
  };
}
