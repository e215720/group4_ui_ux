import { useState, FormEvent, useMemo, useRef, ChangeEvent } from 'react';
import { addAnswer, uploadImage } from '../../services/api';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface UploadedImage {
  filename: string;
  path: string;
  preview: string;
}

interface AnswerFormProps {
  questionId: number;
  onAnswerAdded: () => void;
}

export function AnswerForm({ questionId, onAnswerAdded }: AnswerFormProps) {
  const [content, setContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { themeObject } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const styles = useMemo(() => getStyles(themeObject, isMobile), [themeObject, isMobile]);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      for (const file of Array.from(files)) {
        const { image } = await uploadImage(file);
        setUploadedImages((prev) => [
          ...prev,
          {
            filename: image.filename,
            path: image.path,
            preview: URL.createObjectURL(file),
          },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '画像のアップロードに失敗しました');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('回答を入力してください。');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const images = uploadedImages.map((img) => ({
        filename: img.filename,
        path: img.path,
      }));
      await addAnswer(questionId, content, images.length > 0 ? images : undefined);
      setContent('');
      uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setUploadedImages([]);
      onAnswerAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : '回答の投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = {
    ...styles.button,
    ...(loading || uploading ? styles.buttonDisabled : {}),
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {error && <div style={styles.error}>{error}</div>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        placeholder="回答を入力..."
        rows={4}
        style={styles.textarea}
      />
      <div style={styles.imageUploadArea}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          style={styles.fileInput}
          disabled={uploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={styles.uploadButton}
          disabled={uploading}
        >
          {uploading ? 'アップロード中...' : '画像を添付'}
        </button>
        <span style={styles.uploadHint}>JPEG, PNG, GIF, WebP (最大5MB)</span>
      </div>
      {uploadedImages.length > 0 && (
        <div style={styles.imagePreviewContainer}>
          {uploadedImages.map((img, index) => (
            <div key={img.filename} style={styles.imagePreview}>
              <img src={img.preview} alt="" style={styles.previewImage} />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                style={styles.removeImageButton}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <button type="submit" disabled={loading || uploading} style={buttonStyle}>
        {loading ? '投稿中...' : '回答を投稿する'}
      </button>
    </form>
  );
}

const getStyles = (theme: Theme, isMobile: boolean): { [key: string]: React.CSSProperties } => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: `1px solid ${theme.border}`,
  },
  textarea: {
    padding: '12px',
    borderRadius: '5px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.inputBg,
    color: theme.text,
    fontSize: isMobile ? '14px' : '15px',
    resize: 'vertical',
    minHeight: '80px',
  },
  button: {
    padding: isMobile ? '10px 15px' : '10px 20px',
    backgroundColor: theme.success,
    color: theme.successText,
    border: 'none',
    borderRadius: '5px',
    fontSize: isMobile ? '14px' : '15px',
    cursor: 'pointer',
    alignSelf: 'flex-end',
    fontWeight: '500',
  },
  buttonDisabled: {
    backgroundColor: theme.disabled,
    cursor: 'not-allowed',
  },
  error: {
    color: theme.dangerText,
    backgroundColor: theme.danger,
    padding: '10px',
    borderRadius: '4px',
    fontSize: '14px',
  },
  imageUploadArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  fileInput: {
    display: 'none',
  },
  uploadButton: {
    padding: '6px 12px',
    backgroundColor: theme.subtleText,
    color: theme.body,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  uploadHint: {
    fontSize: '11px',
    color: theme.subtleText,
  },
  imagePreviewContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  imagePreview: {
    position: 'relative',
    width: '80px',
    height: '80px',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '4px',
    border: `1px solid ${theme.border}`,
  },
  removeImageButton: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: theme.danger,
    color: theme.dangerText,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  },
});
