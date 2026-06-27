import { useState, useCallback } from 'react';
import { fetchChaptersBySeriesTantou} from '../services/chapterService';
import type { ChapterRes} from '../services/chapterService';

export const useChapterDetail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterRes | null>(null);

  const fetchChapterDetail = useCallback(async (seriesId: number, chapterId: number) => {
    setLoading(true);
    setError(null);
    try {
      const chapters = await fetchChaptersBySeriesTantou(seriesId);
      const chapter = chapters.find(c => c.chapterId === chapterId);
      if (!chapter) {
        throw new Error('Không tìm thấy chapter');
      }
      setSelectedChapter(chapter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSelected = useCallback(() => {
    setSelectedChapter(null);
    setError(null);
  }, []);

  const refreshChapter = useCallback(async (seriesId: number, chapterId: number) => {
    await fetchChapterDetail(seriesId, chapterId);
  }, [fetchChapterDetail]);

  return {
    selectedChapter,
    loading,
    error,
    fetchChapterDetail,
    clearSelected,
    refreshChapter,
  };
};