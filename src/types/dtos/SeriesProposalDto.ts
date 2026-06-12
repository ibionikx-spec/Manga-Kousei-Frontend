export type ProposalStatusDTO =
  | "pending"
  | "approved"
  | "revision"
  | "rejected";

export interface ProposalGenreDTO {
  genre_id: number;
  name: string;
}

export interface ProposalCharacterDTO {
  character_id: number;
  character_name: string;
  role: string;
  description: string | null;
}

export interface SeriesProposalDTO {
  proposalId: number;
  createdAt: string;
  workingTitle: string;
  synopsis: string;
  targetAudience: string;
  nameSummary: string | null;
  sketchImageUrl: string | null;
  status: ProposalStatusDTO;
  rejectionReason: string | null;
  revisionFeedback: string | null;
  mangaka: {
    userId: number;
    fullName: string;
    avatarUrl: string | null;
  };
  genres: ProposalGenreDTO[];
  characters: ProposalCharacterDTO[];
}
