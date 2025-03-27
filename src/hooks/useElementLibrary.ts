
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  LibraryElement,
  ElementType,
  loadElementLibrary,
  saveElementLibrary,
  createLibraryElement,
  updateLibraryElement,
  deleteLibraryElement
} from '../utils/elementLibraryUtils';

export function useElementLibrary() {
  const [elements, setElements] = useState<LibraryElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lade die Bibliothek beim ersten Rendern
  useEffect(() => {
    try {
      const loadedElements = loadElementLibrary();
      setElements(loadedElements);
    } catch (error) {
      console.error('Fehler beim Laden der Elementbibliothek:', error);
      toast.error('Fehler beim Laden der Elementbibliothek');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Speichere die Bibliothek bei Änderungen
  useEffect(() => {
    if (!isLoading) {
      saveElementLibrary(elements);
    }
  }, [elements, isLoading]);

  // Füge ein neues Element hinzu
  const addElement = useCallback((name: string, type: ElementType, description: string = '', metadata: Record<string, string> = {}) => {
    const newElement = createLibraryElement(name, type, description, metadata);
    setElements(prevElements => [...prevElements, newElement]);
    toast.success(`Element "${name}" hinzugefügt`);
    return newElement;
  }, []);

  // Aktualisiere ein bestehendes Element
  const updateElement = useCallback((elementId: string, updates: Partial<Omit<LibraryElement, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setElements(prevElements => 
      updateLibraryElement(prevElements, { id: elementId, ...updates })
    );
    toast.success('Element aktualisiert');
  }, []);

  // Lösche ein Element
  const deleteElement = useCallback((elementId: string) => {
    setElements(prevElements => deleteLibraryElement(prevElements, elementId));
    toast.info('Element gelöscht');
  }, []);

  // Finde ein Element anhand seiner ID
  const getElementById = useCallback((id: string) => {
    return elements.find(element => element.id === id);
  }, [elements]);

  // Filtere Elemente nach Typ
  const getElementsByType = useCallback((type: ElementType) => {
    return elements.filter(element => element.type === type);
  }, [elements]);

  return {
    elements,
    isLoading,
    addElement,
    updateElement,
    deleteElement,
    getElementById,
    getElementsByType
  };
}
