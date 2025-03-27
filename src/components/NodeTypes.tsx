
import React, { useCallback, useState, useRef, useEffect, memo, ReactNode } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData, SipocNodeType } from '../utils/diagramUtils';

// Define colors for different node types
const NODE_TYPE_COLORS: Record<SipocNodeType, string> = {
  supplier: '#4caf50',
  input: '#2196f3',
  process: '#ff9800',
  output: '#9c27b0',
  customer: '#f44336'
};

// TextUpdaterNode allows users to edit the text of a node
export const TextUpdaterNode = memo(({ data, isConnectable, selected }: NodeProps) => {
  // Get node type from data or default to process
  const nodeType = data.nodeType as SipocNodeType || 'process';
  const nodeColor = NODE_TYPE_COLORS[nodeType] || '#ff9800';
  const [isEditing, setIsEditing] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-focus the textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.focus();
      // Place cursor at the end of the text
      textAreaRef.current.setSelectionRange(
        textAreaRef.current.value.length, 
        textAreaRef.current.value.length
      );
    }
  }, [isEditing]);
  
  // Handle text change
  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (data && typeof data.onLabelChange === 'function') {
      data.onLabelChange(evt.target.value);
    }
  }, [data]);

  // Handle entering edit mode
  const onDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);
  
  // Handle exiting edit mode
  const onBlur = useCallback(() => {
    setIsEditing(false);
  }, []);
  
  // Handle keyboard events
  const onKeyDown = useCallback((evt: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Exit editing mode on Escape
    if (evt.key === 'Escape') {
      setIsEditing(false);
    }
    
    // Apply changes and exit editing mode on Enter without shift
    if (evt.key === 'Enter' && !evt.shiftKey) {
      evt.preventDefault();
      setIsEditing(false);
    }
  }, []);
  
  // Safely access the label with proper typing
  const nodeLabel = data && typeof data.label === 'string' ? data.label : '';
  const displayText = nodeLabel || 'Double-click to edit';
  
  return (
    <div 
      className={`text-updater-node ${selected ? 'selected' : ''}`}
      style={{
        borderColor: nodeColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '4px',
        backgroundColor: `${nodeColor}10` // Very light version of the color
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      
      {isEditing ? (
        <div className="p-3">
          <textarea
            ref={textAreaRef}
            name="text"
            value={nodeLabel}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className="nodrag"
            autoComplete="off"
          />
        </div>
      ) : (
        <div 
          className="p-3 break-words whitespace-pre-wrap min-h-[60px]" 
          onDoubleClick={onDoubleClick}
        >
          {displayText}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
});

// Node type mapping
export const nodeTypes = {
  textUpdater: TextUpdaterNode,
};
