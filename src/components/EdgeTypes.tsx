
import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';

// Define properly typed data interfaces for the edge types
export interface ButtonEdgeData {
  onDelete?: (id: string) => void;
  animated?: boolean;
  [key: string]: any; // Add index signature
}

// Custom edge with a delete button
export const ButtonEdge = React.memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps<ButtonEdgeData>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  
  const onEdgeClick = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    evt.stopPropagation();
    if (data?.onDelete) {
      data.onDelete(id);
    }
  };
  
  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            visibility: 'hidden',
          }}
          className="nodrag nopan edge-button-container group-hover:visible" 
        >
          <button
            className="w-5 h-5 bg-white rounded-full border border-gray-300 flex items-center justify-center shadow-sm hover:bg-gray-100 transition-colors"
            onClick={onEdgeClick}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

export interface SmoothStepEdgeData {
  animated?: boolean;
  [key: string]: any; // Add index signature
}

// Smooth step edge with animation options
export const SmoothStepEdge = React.memo((props: EdgeProps<SmoothStepEdgeData>) => {
  const { style = {}, data, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd } = props;
  
  // Calculate the path
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  
  // Add animation class if specified in data
  const customStyle = {
    ...style,
    ...(data?.animated ? { animation: 'flowLineAnimation 30s infinite linear' } : {}),
  };
  
  return <BaseEdge path={edgePath} markerEnd={markerEnd} style={customStyle} />;
});

// Export types with React.memo for better performance
export const edgeTypes = {
  buttonEdge: ButtonEdge,
  smoothStepEdge: SmoothStepEdge,
};
