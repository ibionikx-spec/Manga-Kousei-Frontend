export interface Character {
  id: number;
  name: string;
  role: string;
  description: string;
}

export interface CreateWorkFormData {
  title: string;
  genreIds: number[];
  targetAudience: string;
  synopsis: string;
  characters: Character[];
  nameSummary: string;
  sketchImage: File | null;
  sketchPreview: string;
}
