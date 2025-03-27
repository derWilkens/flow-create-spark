
import React, { useCallback, useState, useRef, useEffect, memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../utils/diagramUtils';

// TextUpdaterNode allows users to edit the text of a node
export const TextUpdaterNode = memo(({ data, isConnectable, selected }: NodeProps) => {
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
  
  return (
    <div className={`text-updater-node ${selected ? 'selected' : ''}`}>
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
            value={data ? data.label || '' : ''}
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
          {data && data.label ? data.label : 'Double-click to edit'}
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
