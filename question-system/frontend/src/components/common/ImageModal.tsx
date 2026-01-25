import { useMemo } from 'react';
import { useTheme, Theme } from '../../contexts/ThemeContext';

interface ImageModalProps {
  src: string;
  onClose: () => void;
}

export function ImageModal({ src, onClose }: ImageModalProps) {
  const { themeObject } = useTheme();
  const styles = useMemo(() => getStyles(themeObject), [themeObject]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <img src={src} alt="Enlarged view" style={styles.image} />
        <button onClick={onClose} style={styles.closeButton}>
          &times;
        </button>
      </div>
    </div>
  );
}

const getStyles = (theme: Theme): { [key: string]: React.CSSProperties } => ({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    position: 'relative',
    padding: '20px',
    background: theme.formBg,
    borderRadius: '8px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    background: 'none',
    border: 'none',
    color: theme.text,
    fontSize: '30px',
    cursor: 'pointer',
  },
});
