export interface ScheduleEvent {
  eventId: number;
  type: 'chapter' | 'page';
  date: string;
  seriesTitle: string;
  seriesId: number;        
  chapterId: number;       
  chapterNumber: number;
  status: string;
  title: string;
  pageFrom: number | null;
  pageTo: number | null;
}

export interface ScheduleRequestParams {
  tantouId: number;
  from?: string;
  to?: string;
  status?: string;
}