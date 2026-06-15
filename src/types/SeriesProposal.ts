// n#
export type ProposalStatus =
  | "pending"
  | "approved"
  | "revision"
  | "rejected"
  | "pending_admin";

export interface ProposalCharacter {
  character_id: number;
  character_name: string;
  role: string;
  description: string | null;
}

export interface ProposalGenre {
  genre_id: number;
  name: string;
}

export interface SeriesProposal {
  proposal_id: number;
  created_at: string;
  working_title: string;
  synopsis: string;
  target_audience: string;
  name_summary: string | null;
  sketch_image_url: string | null;
  status: ProposalStatus;
  rejection_reason: string | null;
  revision_feedback: string | null;
  mangaka: {
    user_id: number;
    fullName: string;
    avatarUrl: string | null;
  };
  genres: ProposalGenre[];
  characters: ProposalCharacter[];
}
