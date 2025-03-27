
import { useCallback } from 'react';
import { toast } from 'sonner';
import { exportDiagramAsImage } from '../utils/diagramUtils';

export function useDiagramControls(reactFlowInstance: any) {
  // Zoom controls
  const onZoomIn = useCallback(() => {
    if (!reactFlowInstance) return;
    reactFlowInstance.zoomIn({ duration: 300 });
  }, [reactFlowInstance]);
  
  const onZoomOut = useCallback(() => {
    if (!reactFlowInstance) return;
    reactFlowInstance.zoomOut({ duration: 300 });
  }, [reactFlowInstance]);
  
  const onFitView = useCallback(() => {
    if (!reactFlowInstance) return;
    reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
  }, [reactFlowInstance]);
  
  // Export diagram as image
  const onExportDiagram = useCallback(() => {
    if (!reactFlowInstance) return;
    
    exportDiagramAsImage(reactFlowInstance)
      .then(() => {
        toast.success("Diagram exported as image");
      })
      .catch(error => {
        console.error("Failed to export diagram:", error);
        toast.error("Failed to export diagram");
      });
  }, [reactFlowInstance]);

  return {
    onZoomIn,
    onZoomOut,
    onFitView,
    onExportDiagram,
  };
}
