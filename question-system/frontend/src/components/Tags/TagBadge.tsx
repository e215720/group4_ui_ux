import { Tag } from '../../services/api';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
}

export function TagBadge({ tag, onRemove }: TagBadgeProps) {
  return (
    <span style={styles.badge}>
      <span style={styles.hash}>#</span>
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          style={styles.removeButton}
          aria-label={`${tag.name}を削除`}
        >
          ×
        </button>
      )}
    </span>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    padding: '4px 10px',
    borderRadius: '14px',
    fontSize: '13px',
    fontWeight: 600,
  },
  hash: {
    color: '#1976d2',
    fontWeight: 700,
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: '#6c757d',
    cursor: 'pointer',
    padding: '0 2px',
    fontSize: '14px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
  },
};
