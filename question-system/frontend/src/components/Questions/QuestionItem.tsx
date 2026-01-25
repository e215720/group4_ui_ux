import { useState } from 'react';
import { Question, Tag, resolveQuestion, updateQuestionTags } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { AnswerForm } from './AnswerForm';
import { TagBadge, TagInput } from '../Tags';

interface QuestionItemProps {
  question: Question;
  onUpdate: () => void;
}

export function QuestionItem({ question, onUpdate }: QuestionItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editingTags, setEditingTags] = useState<Tag[]>([]);
  const [savingTags, setSavingTags] = useState(false);
  const { user } = useAuth();

  const isAuthor = user?.id === question.author.id;

  const handleStartEditTags = () => {
    setEditingTags(question.tags || []);
    setIsEditingTags(true);
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
    try {
      await resolveQuestion(question.id);
      onUpdate();
    } catch (err) {
      console.error('Failed to resolve question:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h3 style={styles.title}>{question.title}</h3>
          {question.resolved && <span style={styles.resolvedBadge}>解決済み</span>}
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
          {question.images.map((image) => (
            <a
              key={image.id}
              href={`http://localhost:4000${image.path}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.imageLink}
            >
              <img
                src={`http://localhost:4000${image.path}`}
                alt=""
                style={styles.questionImage}
              />
            </a>
          ))}
        </div>
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
          {expanded ? '回答を隠す' : `回答を見る (${question.answers.length})`}
        </button>
        {!question.resolved && (
          <button onClick={handleResolve} style={styles.resolveButton}>
            解決済みにする
          </button>
        )}
      </div>

      {expanded && (
        <div style={styles.answersSection}>
          <h4 style={styles.answersTitle}>回答 ({question.answers.length})</h4>
          {question.answers.length === 0 ? (
            <p style={styles.noAnswers}>まだ回答がありません</p>
          ) : (
            question.answers.map((answer) => (
              <div key={answer.id} style={styles.answer}>
                <div style={styles.answerMeta}>
                  <span style={styles.answerAuthor}>{answer.author.name}</span>
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

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: 'white',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '15px',
  },
  header: {
    marginBottom: '10px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
  },
  resolvedBadge: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  meta: {
    fontSize: '14px',
    color: '#6c757d',
    marginTop: '5px',
  },
  content: {
    marginBottom: '15px',
    lineHeight: 1.6,
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
    border: '1px solid #dee2e6',
    cursor: 'pointer',
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
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '13px',
    padding: 0,
  },
  editTagsSection: {
    marginBottom: '15px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  editTagsActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  saveTagsButton: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  cancelButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#6c757d',
    border: '1px solid #6c757d',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  toggleButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  resolveButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  answersSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #dee2e6',
  },
  answersTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
  },
  noAnswers: {
    color: '#6c757d',
    fontStyle: 'italic',
  },
  answer: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  answerMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
  },
  answerAuthor: {
    fontWeight: 'bold',
  },
  answerDate: {
    color: '#6c757d',
  },
  answerContent: {
    margin: 0,
    lineHeight: 1.5,
  },
};
