import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  RotateCcw,
  Send,
  AlertCircle,
} from 'lucide-react';
import type { ChapterRes, PageDeadline } from '../../services/chapterService';
import {
  setPageDeadline,
  updatePageDeadline,
  deletePageDeadline,
  reviewPageGroup,
  submitChapterToAdmin,
} from '../../services/chapterService';
import { useAuth } from '../../hooks/useAuth';
import './ChapterDetailModal.scss';

interface ChapterDetailModalProps {
  isOpen: boolean;
  chapter: ChapterRes | null;
  seriesId?: number;
  onClose: () => void;
  onRefresh: () => void;
}

export const ChapterDetailModal: React.FC<ChapterDetailModalProps> = ({
  isOpen,
  chapter,
  seriesId,
  onClose,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [editingDeadline, setEditingDeadline] = useState<PageDeadline | null>(null);
  const [newDeadline, setNewDeadline] = useState<{ pageFrom: number; pageTo: number; dueDate: string }>({
    pageFrom: 1,
    pageTo: 1,
    dueDate: new Date().toISOString().split('T')[0],
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  if (!isOpen || !chapter) return null;

  const handleAddDeadline = async () => {
    if (!seriesId) return;
    setLoading(true);
    setError(null);
    try {
      await setPageDeadline(chapter.chapterId, newDeadline);
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi thêm deadline');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDeadline = async (deadlineId: number) => {
    if (!editingDeadline) return;
    setLoading(true);
    setError(null);
    try {
      await updatePageDeadline(deadlineId, {
        pageFrom: editingDeadline.pageFrom,
        pageTo: editingDeadline.pageTo,
        dueDate: editingDeadline.dueDate,
      });
      setEditingDeadline(null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật deadline');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeadline = async (deadlineId: number) => {
    if (!confirm('Bạn có chắc muốn xóa deadline này?')) return;
    setLoading(true);
    setError(null);
    try {
      await deletePageDeadline(deadlineId);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa deadline');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (deadlineId: number, decision: 'approved' | 'revision') => {
    setLoading(true);
    setError(null);
    try {
      await reviewPageGroup(deadlineId, { decision, note: reviewNote || undefined });
      setReviewNote('');
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi review');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitChapter = async () => {
    if (!confirm('Submit chapter này lên admin để duyệt?')) return;
    setLoading(true);
    setError(null);
    try {
      await submitChapterToAdmin(chapter.chapterId);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi submit chapter');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user?.role === 'TANTOU' || user?.role === 'ADMIN';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {chapter.seriesTitle || `Chương ${chapter.chapterNumber}`}
            <span className="chapter-subtitle">
              {chapter.title ? ` - ${chapter.title}` : ''}
            </span>
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="chapter-info">
            <div className="info-row">
              <span className="label">Trạng thái:</span>
              <span className={`status-badge status-${chapter.chapterStatus}`}>
                {chapter.chapterStatus}
              </span>
            </div>
            {chapter.deadline && (
              <div className="info-row">
                <span className="label">Hạn nộp:</span>
                <span>{new Date(chapter.deadline).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
            <div className="info-row">
              <span className="label">Tiến độ:</span>
              <span>
                {chapter.submittedDeadlines || 0} / {chapter.totalDeadlines || 0} nhóm trang đã nộp
              </span>
            </div>
            {chapter.adminNote && (
              <div className="info-row">
                <span className="label">Ghi chú admin:</span>
                <span className="admin-note">{chapter.adminNote}</span>
              </div>
            )}
          </div>

          <div className="deadlines-section">
            <div className="section-header">
              <h3>Page Deadlines</h3>
              {canEdit && !showAddForm && (
                <button className="btn-add" onClick={() => setShowAddForm(true)}>
                  <Plus size={16} /> Thêm
                </button>
              )}
            </div>

            {showAddForm && (
              <div className="add-deadline-form">
                <div className="form-row">
                  <label>
                    Từ trang:
                    <input
                      type="number"
                      value={newDeadline.pageFrom}
                      onChange={(e) =>
                        setNewDeadline({ ...newDeadline, pageFrom: parseInt(e.target.value) || 1 })
                      }
                      min={1}
                    />
                  </label>
                  <label>
                    Đến trang:
                    <input
                      type="number"
                      value={newDeadline.pageTo}
                      onChange={(e) =>
                        setNewDeadline({ ...newDeadline, pageTo: parseInt(e.target.value) || 1 })
                      }
                      min={1}
                    />
                  </label>
                  <label>
                    Ngày hạn:
                    <input
                      type="date"
                      value={newDeadline.dueDate}
                      onChange={(e) =>
                        setNewDeadline({ ...newDeadline, dueDate: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="form-actions">
                  <button className="btn-cancel" onClick={() => setShowAddForm(false)}>
                    Hủy
                  </button>
                  <button className="btn-save" onClick={handleAddDeadline} disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Lưu'}
                  </button>
                </div>
              </div>
            )}

            <div className="deadlines-list">
              {chapter.pageDeadlines && chapter.pageDeadlines.length > 0 ? (
                chapter.pageDeadlines.map((dl) => (
                  <div key={dl.deadlineId} className="deadline-item">
                    {editingDeadline?.deadlineId === dl.deadlineId ? (
                      <div className="edit-deadline-form">
                        <div className="form-row">
                          <label>
                            Từ:
                            <input
                              type="number"
                              value={editingDeadline.pageFrom}
                              onChange={(e) =>
                                setEditingDeadline({
                                  ...editingDeadline,
                                  pageFrom: parseInt(e.target.value) || 1,
                                })
                              }
                              min={1}
                            />
                          </label>
                          <label>
                            Đến:
                            <input
                              type="number"
                              value={editingDeadline.pageTo}
                              onChange={(e) =>
                                setEditingDeadline({
                                  ...editingDeadline,
                                  pageTo: parseInt(e.target.value) || 1,
                                })
                              }
                              min={1}
                            />
                          </label>
                          <label>
                            Ngày:
                            <input
                              type="date"
                              value={editingDeadline.dueDate}
                              onChange={(e) =>
                                setEditingDeadline({
                                  ...editingDeadline,
                                  dueDate: e.target.value,
                                })
                              }
                            />
                          </label>
                        </div>
                        <div className="form-actions">
                          <button className="btn-cancel" onClick={() => setEditingDeadline(null)}>
                            Hủy
                          </button>
                          <button
                            className="btn-save"
                            onClick={() => handleUpdateDeadline(dl.deadlineId)}
                            disabled={loading}
                          >
                            {loading ? 'Đang xử lý...' : 'Cập nhật'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="deadline-info">
                          <span className="deadline-range">
                            Trang {dl.pageFrom} - {dl.pageTo}
                          </span>
                          <span className="deadline-date">
                            Hạn: {new Date(dl.dueDate).toLocaleDateString('vi-VN')}
                          </span>
                          <span className={`status-badge status-${dl.status}`}>
                            {dl.status}
                          </span>
                          {dl.setByName && (
                            <span className="set-by">Tạo bởi: {dl.setByName}</span>
                          )}
                        </div>
                        <div className="deadline-actions">
                          {canEdit && dl.status === 'pending' && (
                            <>
                              <button
                                className="btn-review approved"
                                onClick={() => handleReview(dl.deadlineId, 'approved')}
                                disabled={loading}
                              >
                                <Check size={14} /> Duyệt
                              </button>
                              <button
                                className="btn-review revision"
                                onClick={() => handleReview(dl.deadlineId, 'revision')}
                                disabled={loading}
                              >
                                <RotateCcw size={14} /> Yêu cầu sửa
                              </button>
                            </>
                          )}
                          {canEdit && (
                            <>
                              <button
                                className="btn-edit"
                                onClick={() => setEditingDeadline(dl)}
                                disabled={loading}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDeleteDeadline(dl.deadlineId)}
                                disabled={loading}
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                          {dl.reviewNote && (
                            <div className="review-note">
                              <span className="label">Ghi chú review:</span>
                              <span>{dl.reviewNote}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">Chưa có page deadline nào</div>
              )}
            </div>
          </div>

          {canEdit && chapter.chapterStatus !== 'admin_approved' && (
            <div className="submit-section">
              <button
                className="btn-submit"
                onClick={handleSubmitChapter}
                disabled={loading}
              >
                <Send size={16} />
                Submit chapter lên admin
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};