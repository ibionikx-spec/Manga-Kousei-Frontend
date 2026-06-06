import { Eye, FileText } from "lucide-react";

export interface Chapter {
  id: number;
  title: string;
  pages: number;
  tone: string;
  status: string;
  summary: string;
}

interface ChapterCardProps {
  chapter: Chapter;
}

export default function ChapterCard({ chapter }: ChapterCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-blue-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Chapter {chapter.id}
            </p>
            <h4 className="text-base font-bold text-slate-950">
              {chapter.title}
            </h4>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {chapter.status}
        </span>
      </div>

      <p className="mb-5 text-sm leading-6 text-slate-600">{chapter.summary}</p>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <span className="font-semibold text-slate-500">
          {chapter.pages} pages
        </span>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          {chapter.tone}
        </span>
      </div>

      <button
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
        type="button"
      >
        <Eye className="h-4 w-4" />
        Preview Chapter
      </button>
    </article>
  );
}
