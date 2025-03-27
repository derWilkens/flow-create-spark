
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Definiert die Typen für Bibliothekselemente
export type ElementType = 'supplier' | 'input' | 'process' | 'output' | 'customer' | 'generic';

export interface LibraryElement {
  id: string;
  name: string;
  type: ElementType;
  description: string;
  metadata: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ElementInstance {
  id: string;
  libraryElementId: string;
  // Spezifische Eigenschaften dieser Instanz (z.B. Position)
  position: { x: number, y: number };
  // Lokale Überschreibungen (optional)
  localOverrides?: {
    name?: string;
  };
}

// Speicherschlüssel für die Elementbibliothek
const LIBRARY_STORAGE_KEY = 'diagram-element-library';

// Initialer Zustand für die Bibliothek mit einigen Beispielelementen
const initialLibraryElements: LibraryElement[] = [
  {
    id: uuidv4(),
    name: 'Lieferant A',
    type: 'supplier',
    description: 'Ein Beispiellieferant',
    metadata: { contact: 'kontakt@lieferant-a.de' },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Prozessschritt 1',
    type: 'process',
    description: 'Ein grundlegender Prozessschritt',
    metadata: { owner: 'Prozessverantwortlicher' },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Output X',
    type: 'output',
    description: 'Ein Beispieloutput',
    metadata: { specifications: 'Spezifikationen hier einfügen' },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Lade die Bibliothek aus dem lokalen Speicher oder verwende die Initialbibliothek
export const loadElementLibrary = (): LibraryElement[] => {
  const savedLibrary = localStorage.getItem(LIBRARY_STORAGE_KEY);
  if (savedLibrary) {
    try {
      const parsedLibrary = JSON.parse(savedLibrary);
      // Stelle sicher, dass die Datum-Objekte korrekt geparst werden
      return parsedLibrary.map((element: any) => ({
        ...element,
        createdAt: new Date(element.createdAt),
        updatedAt: new Date(element.updatedAt)
      }));
    } catch (error) {
      console.error('Fehler beim Laden der Elementbibliothek:', error);
      return initialLibraryElements;
    }
  }
  return initialLibraryElements;
};

// Speichert die Bibliothek im lokalen Speicher
export const saveElementLibrary = (library: LibraryElement[]): void => {
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library));
};

// Erstellt ein neues Bibliothekselement
export const createLibraryElement = (
  name: string,
  type: ElementType,
  description: string = '',
  metadata: Record<string, string> = {}
): LibraryElement => {
  const now = new Date();
  return {
    id: uuidv4(),
    name,
    type,
    description,
    metadata,
    createdAt: now,
    updatedAt: now
  };
};

// Erstellt eine neue Instanz eines Bibliothekselements
export const createElementInstance = (
  libraryElementId: string,
  position: { x: number, y: number }
): ElementInstance => {
  return {
    id: uuidv4(),
    libraryElementId,
    position
  };
};

// Finde ein Bibliothekselement anhand seiner ID
export const findLibraryElementById = (
  library: LibraryElement[],
  id: string
): LibraryElement | undefined => {
  return library.find(element => element.id === id);
};

// Aktualisiere ein Bibliothekselement
export const updateLibraryElement = (
  library: LibraryElement[],
  updatedElement: Partial<LibraryElement> & { id: string }
): LibraryElement[] => {
  return library.map(element => {
    if (element.id === updatedElement.id) {
      return {
        ...element,
        ...updatedElement,
        updatedAt: new Date()
      };
    }
    return element;
  });
};

// Lösche ein Bibliothekselement
export const deleteLibraryElement = (
  library: LibraryElement[],
  id: string
): LibraryElement[] => {
  return library.filter(element => element.id !== id);
};
