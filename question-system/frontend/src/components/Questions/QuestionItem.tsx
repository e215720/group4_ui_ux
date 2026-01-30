import { useState, useMemo } from 'react';
import { Question, Tag, resolveQuestion, unresolveQuestion, updateQuestionTags, deleteQuestion } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { AnswerForm } from './AnswerForm';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { TagBadge, TagInput } from '../Tags';
import { ImageModal } from '../common/ImageModal';

interface QuestionItemProps {
  question: Question;
  onUpdate: () => void;
  isTeacher?: boolean;
}

export function QuestionItem({ question, onUpdate, isTeacher }: QuestionItemProps) {
  const { user } = useAuth();
  const { themeObject } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [expanded, setExpanded] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editingTags, setEditingTags] = useState<Tag[]>([]);
  const [savingTags, setSavingTags] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const styles = useMemo(() => getStyles(themeObject, isMobile), [themeObject, isMobile]);

  const isAuthor = user?.id === question.author.id;

  const handleStartEditTags = () => {
    setEditingTags(question.tags || []);
    setIsEditingTags(true);
  };
  
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };


  const handleCancelEditTags = () => {
    setIsEditingTags(false);
    setEditingTags([]);
  };

  const handleSaveTags = async () => {
    setSavingTags(true);
    try {
      await updateQuestionTags(question.id, editingTags.map((t) => t.id));
      setIsEditingTags(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update tags:', error);
    } finally {
      setSavingTags(false);
    }
  };

  const handleResolve = async () => {
    if (!window.confirm('この質問を「解決済み」にしてもよろしいですか？')) return;
    try {
      await resolveQuestion(question.id);
      onUpdate();
    } catch (err) {
      console.error('Failed to resolve question:', err);
      alert('質問の解決に失敗しました。');
    }
  };

  const handleUnresolve = async () => {
    if (!window.confirm('この質問を「未解決」に戻しますか？')) return;
    try {
      await unresolveQuestion(question.id);
      onUpdate();
    } catch (err) {
      console.error('Failed to unresolve question:', err);
      alert('質問の状態変更に失敗しました。');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('この質問を削除しますか？削除すると元に戻せません。')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteQuestion(question.id);
      onUpdate();
    } catch (err) {
      console.error('Failed to delete question:', err);
      alert('質問の削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' });
  };

  const canResolve = isTeacher || user?.id === question.author.id;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h3 style={styles.title}>{question.title}</h3>
          <span style={question.resolved ? styles.resolvedBadge : styles.unresolvedBadge}>
            {question.resolved ? '解決済み' : '未解決'}
          </span>
        </div>
        <div style={styles.meta}>
          <span>投稿者: {question.author.name}</span>
          <span> | </span>
          <span>{formatDate(question.createdAt)}</span>
        </div>
      </div>

      <p style={styles.content}>{question.content}</p>

      {question.images && question.images.length > 0 && (
        <div style={styles.imagesSection}>
          {question.images.map((image) => {
            const imageUrl = image.path;
            return (
              <div
                key={image.id}
                style={styles.imageLink}
                onClick={() => handleImageClick(imageUrl)}
              >
                <img
                  src={imageUrl}
                  alt={`Question content image ${image.id}`}
                  style={styles.questionImage}
                />
              </div>
            );
          })}
        </div>
      )}

      {selectedImage && (
        <ImageModal src={selectedImage} onClose={handleCloseModal} />
      )}

      {question.tags && question.tags.length > 0 && !isEditingTags && (
        <div style={styles.tagsSection}>
          <div style={styles.tagsList}>
            {question.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
          {isAuthor && (
            <button onClick={handleStartEditTags} style={styles.editTagsButton}>
              タグを編集
            </button>
          )}
        </div>
      )}

      {question.tags && question.tags.length === 0 && isAuthor && !isEditingTags && (
        <div style={styles.tagsSection}>
          <button onClick={handleStartEditTags} style={styles.editTagsButton}>
            タグを追加
          </button>
        </div>
      )}

      {isEditingTags && (
        <div style={styles.editTagsSection}>
          <TagInput
            lectureId={question.lecture.id}
            selectedTags={editingTags}
            onChange={setEditingTags}
          />
          <div style={styles.editTagsActions}>
            <button
              onClick={handleSaveTags}
              disabled={savingTags}
              style={styles.saveTagsButton}
            >
              {savingTags ? '保存中...' : '保存'}
            </button>
            <button
              onClick={handleCancelEditTags}
              disabled={savingTags}
              style={styles.cancelButton}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div style={styles.actions}>
        <button onClick={() => setExpanded(!expanded)} style={styles.toggleButton}>
          {expanded ? '回答を閉じる' : `回答 (${question.answers.length})`}
        </button>
        {canResolve && !question.resolved && (
          <button onClick={handleResolve} style={styles.resolveButton}>
            解決済みにする
          </button>
        )}
        {canResolve && question.resolved && (
          <button onClick={handleUnresolve} style={styles.unresolveButton}>
            未解決に戻す
          </button>
        )}
        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={styles.deleteButton}
          >
            {isDeleting ? '削除中...' : '削除'}
          </button>
        )}
      </div>

      {expanded && (
        <div style={styles.answersSection}>
          <h4 style={styles.answersTitle}>回答</h4>
          {question.answers.length === 0 ? (
            <p style={styles.noAnswers}>まだ回答がありません</p>
          ) : (
            question.answers.map((answer) => (
              <div key={answer.id} style={styles.answer}>
                <div style={styles.answerMeta}>
                  <span style={styles.answerAuthor}>
                    {answer.author.name} {answer.author.role === 'TEACHER' && '(教師)'}
                  </span>
                  <span style={styles.answerDate}>{formatDate(answer.createdAt)}</span>
                </div>
                <p style={styles.answerContent}>{answer.content}</p>
              </div>
            ))
          )}
          
          {!question.resolved && (
            <AnswerForm questionId={question.id} onAnswerAdded={onUpdate} />
          )}
        </div>
      )}
    </div>
  );
}

const getStyles = (theme: Theme, isMobile: boolean): { [key: string]: React.CSSProperties } => ({
  container: {
    backgroundColor: theme.columnBg,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    padding: isMobile ? '15px' : '20px',
  },
  header: {
    marginBottom: '15px',
    borderBottom: `1px solid ${theme.border}`,
    paddingBottom: '15px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  title: {
    margin: 0,
    fontSize: isMobile ? '17px' : '19px',
    fontWeight: 600,
    color: theme.text,
  },
  resolvedBadge: {
    backgroundColor: theme.badgeResolvedBg,
    color: theme.badgeResolvedText,
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  unresolvedBadge: {
    backgroundColor: theme.badgeUnresolvedBg,
    color: theme.badgeUnresolvedText,
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  meta: {
    fontSize: '13px',
    color: theme.subtleText,
  },
  content: {
    marginBottom: '20px',
    lineHeight: 1.6,
    color: theme.text,
    wordBreak: 'break-word',
  },
  imagesSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '15px',
  },
  imageLink: {
    display: 'block',
  },
  questionImage: {
    maxWidth: '300px',
    maxHeight: '200px',
    objectFit: 'contain',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    '&:hover': {
      opacity: 0.8,
    }
  },
  tagsSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
    flexWrap: 'wrap',
  },
  tagsList: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  editTagsButton: {
    background: 'none',
    border: 'none',
    color: theme.primary,
    cursor: 'pointer',
    fontSize: '13px',
    padding: 0,
  },
  editTagsSection: {
    marginBottom: '15px',
    padding: '15px',
    backgroundColor: theme.formBg,
    borderRadius: '8px',
  },
  editTagsActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  saveTagsButton: {
    padding: '6px 12px',
    backgroundColor: theme.primary,
    color: theme.primaryText,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  cancelButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: theme.subtleText,
    border: `1px solid ${theme.subtleText}`,
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  toggleButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: theme.primary,
    border: `1px solid ${theme.primary}`,
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: isMobile ? '13px' : '14px',
  },
  resolveButton: {
    padding: '8px 16px',
    backgroundColor: theme.success,
    color: theme.successText,
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: isMobile ? '13px' : '14px',
  },
  unresolveButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: isMobile ? '13px' : '14px',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  answersSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: `1px solid ${theme.border}`,
  },
  answersTitle: {
    margin: '0 0 15px 0',
    fontSize: isMobile ? '16px' : '17px',
    color: theme.text,
  },
  noAnswers: {
    color: theme.subtleText,
    padding: '10px 0',
  },
  answer: {
    backgroundColor: theme.answerBg,
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '10px',
    borderLeft: `3px solid ${theme.primary}`,
  },
  answerMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
    flexWrap: 'wrap',
    gap: '5px',
  },
  answerAuthor: {
    fontWeight: 'bold',
    color: theme.text,
  },
  answerDate: {
    color: theme.subtleText,
    fontSize: '13px',
  },
  answerContent: {
    margin: 0,
    lineHeight: 1.5,
    color: theme.text,
    wordBreak: 'break-word',
  },
});
