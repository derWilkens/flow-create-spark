
import React, { useState } from 'react';
import { LibraryElement, ElementType } from '../utils/elementLibraryUtils';
import { useElementLibrary } from '../hooks/useElementLibrary';
import { Button } from './ui/button';
import { Plus, Edit, Trash, Move } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

// Farbkonfiguration für verschiedene Elementtypen
const elementTypeColors: Record<ElementType, string> = {
  supplier: '#4caf50',
  input: '#2196f3',
  process: '#ff9800',
  output: '#9c27b0',
  customer: '#f44336',
  generic: '#607d8b'
};

// Labels für die Elementtypen
const elementTypeLabels: Record<ElementType, string> = {
  supplier: 'Lieferant',
  input: 'Input',
  process: 'Prozess',
  output: 'Output',
  customer: 'Kunde',
  generic: 'Allgemein'
};

// Komponentenprops
interface ElementLibraryProps {
  onElementDragStart: (element: LibraryElement) => void;
}

export default function ElementLibrary({ onElementDragStart }: ElementLibraryProps) {
  const { elements, isLoading, addElement, updateElement, deleteElement } = useElementLibrary();
  const [selectedTab, setSelectedTab] = useState<ElementType>('generic');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newElementName, setNewElementName] = useState('');
  const [newElementDesc, setNewElementDesc] = useState('');

  // Filter elements by selected type
  const filteredElements = elements.filter(el => el.type === selectedTab);

  const handleAddElement = () => {
    if (newElementName.trim()) {
      addElement(newElementName, selectedTab, newElementDesc);
      setNewElementName('');
      setNewElementDesc('');
      setShowAddDialog(false);
    }
  };

  const handleDragStart = (event: React.DragEvent, element: LibraryElement) => {
    // Setze die zu übertragenden Daten
    event.dataTransfer.setData('application/reactflow', JSON.stringify(element));
    event.dataTransfer.effectAllowed = 'move';
    
    // Informiere die übergeordnete Komponente
    onElementDragStart(element);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Lade Elemente...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium">Elementbibliothek</h2>
        <p className="text-sm text-gray-500">Ziehen Sie Elemente in Ihr Diagramm</p>
      </div>

      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as ElementType)} className="flex-1 flex flex-col">
        <div className="border-b border-gray-200">
          <TabsList className="w-full justify-start px-2 py-1">
            {Object.entries(elementTypeLabels).map(([type, label]) => (
              <TabsTrigger key={type} value={type} className="py-1 px-3 text-xs">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {Object.keys(elementTypeLabels).map((type) => (
            <TabsContent key={type} value={type} className="mt-0 h-full">
              {filteredElements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Keine {elementTypeLabels[type as ElementType]} Elemente vorhanden
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredElements.map((element) => (
                    <div
                      key={element.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, element)}
                      className="p-3 rounded border border-gray-200 shadow-sm bg-white hover:shadow-md cursor-grab flex items-center gap-2"
                      style={{borderLeft: `4px solid ${elementTypeColors[element.type]}`}}
                    >
                      <Move size={16} className="text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium">{element.name}</div>
                        {element.description && (
                          <div className="text-xs text-gray-500 truncate">{element.description}</div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deleteElement(element.id)}>
                        <Trash size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>

      <div className="p-3 border-t border-gray-200">
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full" size="sm">
              <Plus size={16} className="mr-2" />
              Neues Element
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Element hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium">Typ</label>
                <select 
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  value={selectedTab}
                  onChange={(e) => setSelectedTab(e.target.value as ElementType)}
                >
                  {Object.entries(elementTypeLabels).map(([type, label]) => (
                    <option key={type} value={type}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  value={newElementName}
                  onChange={(e) => setNewElementName(e.target.value)}
                  placeholder="Elementname eingeben"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Beschreibung (optional)</label>
                <textarea 
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  value={newElementDesc}
                  onChange={(e) => setNewElementDesc(e.target.value)}
                  placeholder="Beschreibung eingeben"
                  rows={3}
                />
              </div>
              <Button onClick={handleAddElement}>Element hinzufügen</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
