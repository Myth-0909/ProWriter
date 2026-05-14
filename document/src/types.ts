export interface Document {
  id: string;
  title: string;
  content: string;
  preview: string;
  category: DocumentCategory;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt?: string;
}

export type DocumentCategory = "sciFi" | "fantasy" | "design" | "journal" | "planning" | "research" | "general";

export const categoryLabels: Record<DocumentCategory, { zh: string; en: string }> = {
  sciFi: { zh: "科幻小说", en: "Sci-Fi Novel" },
  fantasy: { zh: "奇幻", en: "Fantasy" },
  design: { zh: "设计", en: "Design" },
  journal: { zh: "日记", en: "Journal" },
  planning: { zh: "规划", en: "Planning" },
  research: { zh: "研究", en: "Research" },
  general: { zh: "通用", en: "General" },
};

export const categoryIcons: Record<DocumentCategory, string> = {
  sciFi: "BookOpen",
  fantasy: "FileText",
  design: "Palette",
  journal: "Lightbulb",
  planning: "Target",
  research: "Search",
  general: "FileText",
};

export const categoryColors: Record<DocumentCategory, string> = {
  sciFi: "bg-purple-100 text-purple-600",
  fantasy: "bg-blue-100 text-blue-600",
  design: "bg-amber-100 text-amber-600",
  journal: "bg-green-100 text-green-600",
  planning: "bg-red-100 text-red-600",
  research: "bg-cyan-100 text-cyan-600",
  general: "bg-brand-100 text-brand-600",
};
