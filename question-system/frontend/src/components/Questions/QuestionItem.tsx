import { useState, useMemo } from 'react';
import { Question, resolveQuestion } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { AnswerForm } from './AnswerForm';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';

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

  const styles = useMemo(() => getStyles(themeObject, isMobile), [themeObject, isMobile]);

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

      <div style={styles.actions}>
        <button onClick={() => setExpanded(!expanded)} style={styles.toggleButton}>
          {expanded ? '回答を閉じる' : `回答 (${question.answers.length})`}
        </button>
        {canResolve && !question.resolved && (
          <button onClick={handleResolve} style={styles.resolveButton}>
            解決済みにする
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
