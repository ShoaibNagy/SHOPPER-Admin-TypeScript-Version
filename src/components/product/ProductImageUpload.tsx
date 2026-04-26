import { useState, useRef, useCallback } from 'react';
import { Button } from '@components/ui/Button';
import { useUploadProductImages, useDeleteProductImage, useAdminProduct } from '@hooks/useAdminProducts';
import { productsApi } from '@api/products.api';

interface ProductImageUploadProps {
  productId: string;
}

export function ProductImageUpload({ productId }: ProductImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previews,   setPreviews]   = useState<{ file: File; url: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: product }     = useAdminProduct(productId);
  const uploadMutation         = useUploadProductImages(productId);
  const deleteMutation         = useDeleteProductImage(productId);

  // ── File handling ──────────────────────────────────────────────────────
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    const newPreviews = valid.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setPreviews(p => [...p, ...newPreviews]);
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function onUpload() {
    if (!previews.length) return;
    uploadMutation.mutate(previews.map(p => p.file), {
      onSuccess: () => {
        previews.forEach(p => URL.revokeObjectURL(p.url));
        setPreviews([]);
      },
    });
  }

  async function setPrimary(imageId: string) {
    await productsApi.setPrimaryImage(productId, imageId);
  }

  const existingImages = product?.images ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Existing images ──────────────────────────────────────── */}
      {existingImages.length > 0 && (
        <div>
          <p style={labelStyle}>Current Images</p>
          <div style={gridStyle}>
            {existingImages.map(img => (
              <div key={img._id} style={imgCardStyle}>
                <img src={img.url} alt={img.alt ?? ''} style={imgStyle} />
                {img.isPrimary && (
                  <span style={primaryBadgeStyle}>Primary</span>
                )}
                <div style={imgActionsStyle}>
                  {!img.isPrimary && (
                    <button
                      type="button"
                      style={imgBtnStyle}
                      onClick={() => void setPrimary(img._id)}
                      title="Set as primary"
                    >
                      ★
                    </button>
                  )}
                  <button
                    type="button"
                    style={{ ...imgBtnStyle, color: '#ef4444' }}
                    onClick={() => deleteMutation.mutate(img._id)}
                    title="Delete image"
                    disabled={deleteMutation.isPending}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Drop zone ────────────────────────────────────────────── */}
      <div
        style={{
          ...dropZoneStyle,
          borderColor: isDragging ? '#f97316' : '#383838',
          background:  isDragging ? 'rgba(249,115,22,0.06)' : '#1c1c1c',
        }}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload images"
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" style={{ color: '#4a4a4a' }}>
          <path d="M14 4v16M6 12l8-8 8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 22h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <p style={{ color: '#9a9a9a', fontSize: 13, margin: 0 }}>
          Drag & drop images here, or <span style={{ color: '#f97316' }}>browse</span>
        </p>
        <p style={{ color: '#4a4a4a', fontSize: 11, margin: 0 }}>PNG, JPG, WebP — up to 5 MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* ── Staged previews ──────────────────────────────────────── */}
      {previews.length > 0 && (
        <div>
          <p style={labelStyle}>Ready to upload ({previews.length})</p>
          <div style={gridStyle}>
            {previews.map((p, i) => (
              <div key={i} style={imgCardStyle}>
                <img src={p.url} alt="" style={imgStyle} />
                <button
                  type="button"
                  style={{ ...imgBtnStyle, position: 'absolute', top: 4, right: 4, color: '#ef4444', background: 'rgba(0,0,0,0.6)' }}
                  onClick={() => setPreviews(prev => {
                    URL.revokeObjectURL(p.url);
                    return prev.filter((_, j) => j !== i);
                  })}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Button
              variant="primary" size="sm" type="button"
              isLoading={uploadMutation.isPending}
              onClick={onUpload}
            >
              {uploadMutation.isPending ? 'Uploading…' : `Upload ${previews.length} image${previews.length > 1 ? 's' : ''}`}
            </Button>
            <Button
              variant="ghost" size="sm" type="button"
              onClick={() => {
                previews.forEach(p => URL.revokeObjectURL(p.url));
                setPreviews([]);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: '#9a9a9a', marginBottom: 8, display: 'block' };
const gridStyle: React.CSSProperties  = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 8 };

const imgCardStyle: React.CSSProperties = {
  position: 'relative', borderRadius: 6, overflow: 'hidden',
  border: '1px solid #383838', background: '#242424', aspectRatio: '1',
};

const imgStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };

const primaryBadgeStyle: React.CSSProperties = {
  position: 'absolute', bottom: 4, left: 4,
  background: 'rgba(249,115,22,0.9)', color: '#fff',
  fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
  textTransform: 'uppercase', letterSpacing: '0.04em',
};

const imgActionsStyle: React.CSSProperties = {
  position: 'absolute', top: 4, right: 4,
  display: 'flex', gap: 3,
};

const imgBtnStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.55)', border: 'none',
  borderRadius: 4, color: '#f0f0f0', cursor: 'pointer',
  width: 22, height: 22, display: 'flex', alignItems: 'center',
  justifyContent: 'center', fontSize: 11, lineHeight: 1,
};

const dropZoneStyle: React.CSSProperties = {
  border: '1.5px dashed', borderRadius: 8,
  padding: '28px 20px', cursor: 'pointer',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', gap: 8,
  transition: 'border-color 0.15s, background 0.15s',
};