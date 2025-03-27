
import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import DiagramEditor from '../components/DiagramEditor';
import SipocEditor from '../components/SipocEditor';
import { useViewState } from '../hooks/useViewState';
import { Button } from '../components/ui/button';
import { LayoutGrid, GitBranch } from 'lucide-react';

const Index = () => {
  const { currentView, toggleView, isFlowView, isSipocView } = useViewState();
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium">
            {isFlowView ? 'Flow Diagram' : 'SIPOC Diagram'}
          </h1>
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Beta</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {isFlowView 
              ? 'Double-click to add nodes • Drag between handles to connect' 
              : 'Double-click in a column to add nodes • Drag between handles to connect'}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleView}
            className="flex items-center gap-2"
          >
            {isFlowView ? (
              <>
                <LayoutGrid size={16} />
                <span>SIPOC View</span>
              </>
            ) : (
              <>
                <GitBranch size={16} />
                <span>Flow View</span>
              </>
            )}
          </Button>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <ReactFlowProvider>
          {isFlowView ? 
            <DiagramEditor viewType="flow" /> : 
            <SipocEditor viewType="sipoc" />
          }
        </ReactFlowProvider>
      </main>
    </div>
  );
};

export default Index;
