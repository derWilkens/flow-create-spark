import { useState, useCallback } from 'react';

// Define the available view types
export type ViewType = 'flow' | 'sipoc';

export function useViewState() {
  // State for the current view
  const [currentView, setCurrentView] = useState<ViewType>('flow');
  
  // Toggle between views
  const toggleView = useCallback(() => {
    setCurrentView(prev => prev === 'flow' ? 'sipoc' : 'flow');
  }, []);
  
  // Set a specific view
  const setView = useCallback((view: ViewType) => {
    setCurrentView(view);
  }, []);
  
  return {
    currentView,
    toggleView,
    setView,
    isFlowView: currentView === 'flow',
    isSipocView: currentView === 'sipoc',
  };
}
