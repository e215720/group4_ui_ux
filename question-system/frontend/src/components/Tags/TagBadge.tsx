import { useMemo } from 'react';
import { Tag } from '../../services/api';
import { useTheme, Theme } from '../../contexts/ThemeContext';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
}

export function TagBadge({ tag, onRemove }: TagBadgeProps) {
  const { themeObject } = useTheme();
  const styles = useMemo(() => getStyles(themeObject), [themeObject]);

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

const getStyles = (theme: Theme): { [key: string]: React.CSSProperties } => ({
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    backgroundColor: theme.tagBg,
    color: theme.tagText,
    padding: '4px 10px',
    borderRadius: '14px',
    fontSize: '13px',
    fontWeight: 600,
  },
  hash: {
    color: theme.primary,
    fontWeight: 700,
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: theme.subtleText,
    cursor: 'pointer',
    padding: '0 2px',
    marginLeft: '4px',
    fontSize: '14px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
  },
});
