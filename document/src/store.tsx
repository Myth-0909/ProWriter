import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Document } from "@/types";

// ==================== Mock Data ====================

const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Untitled Document",
    content: "<p>Start writing your next masterpiece here. The canvas is yours, waiting to be filled with ideas that matter. Every great story begins with a single word — make yours count.</p><p>The blank page is not your enemy; it is an invitation. An opportunity to create something that has never existed before.</p>",
    preview: "Start writing your next masterpiece here. The canvas is yours...",
    category: "general",
    createdAt: "2026-05-12T10:00:00Z",
    updatedAt: "2026-05-12T14:30:00Z",
    isFavorite: false,
    isDeleted: false,
  },
  {
    id: "2",
    title: "The Zenith Protocol",
    content: "<h1>The Zenith Protocol</h1><p>In the quiet corridors of the research station, the air hummed with a low-frequency pulse that indicated the prototype was active.</p><p>Dr. Chen adjusted her goggles and leaned closer to the observation window. What she saw defied every textbook she had ever read.</p><p>The machine wasn't just generating energy — it was bending the very fabric of spacetime around it, creating ripples that extended far beyond the laboratory walls.</p>",
    preview: "In the quiet corridors of the research station, the air hummed with a low-frequency pulse...",
    category: "sciFi",
    createdAt: "2026-05-10T08:00:00Z",
    updatedAt: "2026-05-11T22:15:00Z",
    isFavorite: true,
    isDeleted: false,
  },
  {
    id: "3",
    title: "Shadows of Aetheria",
    content: "<h1>Shadows of Aetheria</h1><h2>Chapter 4: The Duskwater Market</h2><p>The market at Duskwater was alive with the smell of roasted spices and the chatter of merchants from across the Seven Kingdoms. Kael pulled his hood lower, his hand never straying far from the hilt of his blade.</p><p>Someone was following him. He had sensed it since dawn — a shadow that moved when it shouldn't, a presence that lingered just beyond perception.</p>",
    preview: "Chapter 4: The market at Duskwater was alive with the smell of roasted spices...",
    category: "fantasy",
    createdAt: "2026-05-08T12:00:00Z",
    updatedAt: "2026-05-11T18:00:00Z",
    isFavorite: false,
    isDeleted: false,
  },
  {
    id: "4",
    title: "Brand Identity Guide 2024",
    content: "<h1>Brand Identity Guide 2024</h1><p>This document outlines the core visual principles for the upcoming rebrand, including typography choices and the new color palette.</p><h2>Typography</h2><p>Primary typeface: Inter. This clean, modern sans-serif provides excellent readability across all screen sizes while maintaining a distinctive character.</p><h2>Color System</h2><p>The new palette draws from natural tones, emphasizing trust and sophistication through deep blues and warm neutrals.</p>",
    preview: "This document outlines the core visual principles for the upcoming rebrand...",
    category: "design",
    createdAt: "2026-05-05T09:00:00Z",
    updatedAt: "2026-05-09T16:30:00Z",
    isFavorite: false,
    isDeleted: false,
  },
  {
    id: "5",
    title: "Morning Muse Thoughts",
    content: "<p>Sometimes the best ideas come when the city is still asleep and the coffee is just starting to take effect.</p><p>Today's focus: exploring the relationship between creativity and constraint. The most beautiful designs emerge not from unlimited freedom, but from working within carefully chosen boundaries.</p><p>Note to self: research the Japanese concept of 'ma' — the meaningful emptiness between things.</p>",
    preview: "Sometimes the best ideas come when the city is still asleep and the coffee is just starting...",
    category: "journal",
    createdAt: "2026-05-03T06:00:00Z",
    updatedAt: "2026-05-10T07:45:00Z",
    isFavorite: true,
    isDeleted: false,
  },
  {
    id: "6",
    title: "Project Roadmap Phase 2",
    content: "<h1>Project Roadmap - Phase 2</h1><h2>Key Milestones</h2><ol><li>Finalize editor canvas components</li><li>Implement collaborative syncing</li><li>Beta testing with elite users</li><li>Performance optimization pass</li></ol><h2>Timeline</h2><p>Estimated completion: Q3 2026. Weekly check-ins every Monday at 10am.</p>",
    preview: "Key milestones: 1. Finalize editor canvas components. 2. Implement collaborative syncing...",
    category: "planning",
    createdAt: "2026-04-28T11:00:00Z",
    updatedAt: "2026-05-07T20:00:00Z",
    isFavorite: false,
    isDeleted: false,
  },
  {
    id: "7",
    title: "API Integration Spec",
    content: "<h1>API Integration Specification</h1><h2>Authentication</h2><p>Implement OAuth 2.0 with PKCE flow for all client applications. Token refresh should be handled transparently.</p><h2>Endpoints</h2><p>RESTful API design with versioning in the URL path. All responses wrapped in a standard envelope with status codes and error messages.</p>",
    preview: "Functional requirements for the new API integration including authentication...",
    category: "research",
    createdAt: "2026-04-25T13:00:00Z",
    updatedAt: "2026-04-30T09:20:00Z",
    isFavorite: false,
    isDeleted: false,
  },
  {
    id: "8",
    title: "Q4 Market Analysis",
    content: "<h1>Q4 Market Analysis</h1><p>Analyzing market trends and competitor performance for the final quarter of the fiscal year.</p><h2>Key Findings</h2><p>The writing tool market has grown 34% YoY, driven primarily by remote work adoption and the creator economy. Our primary competitor launched AI features in September — we need to respond.</p>",
    preview: "Analyzing market trends and competitor performance for the final quarter...",
    category: "research",
    createdAt: "2026-04-20T10:00:00Z",
    updatedAt: "2026-04-25T15:00:00Z",
    isFavorite: false,
    isDeleted: false,
  },
  {
    id: "9",
    title: "Chapter 4 - Draft",
    content: "<h1>Chapter 4</h1><p>The fog rolled in over the harbor, thick as wool blankets. Visibility dropped to near zero in the space of minutes. Ships that had been visible on the horizon moments before simply ceased to exist.</p><p>Marta pulled her coat tighter and continued walking. She had learned long ago that the fog was not to be feared — it was to be used.</p>",
    preview: "Chapter 4: The fog rolled in over the harbor, thick as wool blankets...",
    category: "fantasy",
    createdAt: "2026-04-15T22:00:00Z",
    updatedAt: "2026-04-18T23:59:00Z",
    isFavorite: false,
    isDeleted: false,
  },
];

// ==================== Store Context ====================

interface DocumentStore {
  documents: Document[];
  favorites: Document[];
  trash: Document[];
  getDocument: (id: string) => Document | undefined;
  createDocument: () => string;
  updateDocument: (id: string, updates: Partial<Pick<Document, "title" | "content">>) => void;
  toggleFavorite: (id: string) => void;
  moveToTrash: (id: string) => void;
  restoreFromTrash: (id: string) => void;
  permanentlyDelete: (id: string) => void;
  emptyTrash: () => void;
}

const DocumentStoreContext = createContext<DocumentStore>({
  documents: [],
  favorites: [],
  trash: [],
  getDocument: () => undefined,
  createDocument: () => "",
  updateDocument: () => {},
  toggleFavorite: () => {},
  moveToTrash: () => {},
  restoreFromTrash: () => {},
  permanentlyDelete: () => {},
  emptyTrash: () => {},
});

export function useDocuments() {
  return useContext(DocumentStoreContext);
}

export function DocumentStoreProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);

  const activeDocs = documents.filter((d) => !d.isDeleted);
  const favorites = activeDocs.filter((d) => d.isFavorite);
  const trashDocs = documents.filter((d) => d.isDeleted);

  const getDocument = useCallback(
    (id: string) => documents.find((d) => d.id === id),
    [documents]
  );

  const createDocument = useCallback(() => {
    const id = `doc-${Date.now()}`;
    const now = new Date().toISOString();
    const newDoc: Document = {
      id,
      title: "Untitled Document",
      content: "",
      preview: "",
      category: "general",
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
      isDeleted: false,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    return id;
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Pick<Document, "title" | "content">>) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, ...updates, updatedAt: new Date().toISOString(), preview: updates.content ? updates.content.replace(/<[^>]*>/g, "").slice(0, 80) + "..." : d.preview }
          : d
      )
    );
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isFavorite: !d.isFavorite } : d))
    );
  }, []);

  const moveToTrash = useCallback((id: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, isDeleted: true, isFavorite: false, deletedAt: new Date().toISOString() }
          : d
      )
    );
  }, []);

  const restoreFromTrash = useCallback((id: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, isDeleted: false, deletedAt: undefined } : d
      )
    );
  }, []);

  const permanentlyDelete = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const emptyTrash = useCallback(() => {
    setDocuments((prev) => prev.filter((d) => !d.isDeleted));
  }, []);

  return (
    <DocumentStoreContext.Provider
      value={{
        documents: activeDocs,
        favorites,
        trash: trashDocs,
        getDocument,
        createDocument,
        updateDocument,
        toggleFavorite,
        moveToTrash,
        restoreFromTrash,
        permanentlyDelete,
        emptyTrash,
      }}
    >
      {children}
    </DocumentStoreContext.Provider>
  );
}
