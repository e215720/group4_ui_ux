import { useState } from 'react';
import { Question, resolveQuestion } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { AnswerForm } from './AnswerForm';

interface QuestionItemProps {
  question: Question;
  onUpdate: () => void;
}

export function QuestionItem({ question, onUpdate }: QuestionItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();

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
