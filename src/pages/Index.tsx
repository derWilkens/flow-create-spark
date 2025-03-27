
import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import DiagramEditor from '../components/DiagramEditor';

const Index = () => {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium">Flow Diagram</h1>
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Beta</span>
        </div>
        <div className="text-sm text-gray-500">
          Double-click to add nodes • Drag between handles to connect
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <ReactFlowProvider>
          <DiagramEditor />
        </ReactFlowProvider>
      </main>
    </div>
  );
};

export default Index;
