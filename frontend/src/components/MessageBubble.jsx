import { useState } from 'react';
import Lightbox from './Lightbox';

const TYPE_CONFIG = {
  note:     { color: 'rgba(255,255,255,0.04)', border: 'var(--border-2)', label: 'Note' },
  password: { color: 'rgba(240,165,0,0.06)',   border: 'rgba(240,165,0,0.18)', label: 'Password' },
  link:     { color: 'rgba(52,211,153,0.06)',  border: 'rgba(52,211,153,0.18)', label: 'Link' },
  image:    { color: 'rgba(96,165,250,0.06)',  border: 'rgba(96,165,250,0.18)', label: 'Image' },
  file:     { color: 'rgba(167,139,250,0.06)', border: 'rgba(167,139,250,0.18)', label: 'File' },
};

const TypeIcon = ({ type }) => {
  const icons = {
    note: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    password: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    link: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    image: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    file: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
  };
  return icons[type] || icons.note;
};

export default function MessageBubble({ item, onDelete, onEdit }) {
  const [revealed, setRevealed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.note;

  const handleSave = () => {
    onEdit(item.id, { title: item.title, content: editContent });
    setEditing(false);
  };

  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const renderContent = () => {
    if (item.type === 'password') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <span className="mono" style={{ fontSize: 13, color: revealed ? 'var(--accent)' : 'var(--text-2)', letterSpacing: revealed ? 'normal' : '0.12em' }}>
            {revealed ? item.content : '•'.repeat(Math.min(item.content?.length || 10, 14))}
          </span>
          <button onClick={() => setRevealed(!revealed)} style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {revealed ? 'hide' : 'reveal'}
          </button>
          {revealed && (
            <button onClick={() => navigator.clipboard.writeText(item.content)} style={{ fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              copy
            </button>
          )}
        </div>
      );
    }

    if (item.type === 'image') {
      return (
        <img
          src={item.content}
          alt={item.title}
          style={{ marginTop: 10, borderRadius: 12, maxHeight: 260, maxWidth: '100%', objectFit: 'cover', cursor: 'zoom-in', display: 'block', transition: 'opacity 0.15s' }}
          onClick={() => setLightboxSrc(item.content)}
          onMouseOver={e => e.target.style.opacity = '0.85'}
          onMouseOut={e => e.target.style.opacity = '1'}
        />
      );
    }

    if (item.type === 'link') {
      return (
        <a href={item.content} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#34d399', display: 'block', marginTop: 8, wordBreak: 'break-all', textDecoration: 'none' }}
          onMouseOver={e => e.target.style.opacity = '0.7'} onMouseOut={e => e.target.style.opacity = '1'}>
          {item.content}
        </a>
      );
    }

    if (item.type === 'file') {
      return (
        <a
          href={item.content}
          target="_blank"
          rel="noreferrer"
          download={item.file_name}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, padding: '10px 14px', background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: 12, textDecoration: 'none', transition: 'border-color 0.15s' }}
          onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-3)'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ color: 'var(--text-1)', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.file_name || item.title}</p>
            <p style={{ color: 'var(--text-3)', fontSize: 11, marginTop: 2 }}>Click to download</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </a>
      );
    }

    if (editing) {
      return (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            rows={3}
            autoFocus
            style={{ background: 'var(--bg-2)', border: '1px solid var(--accent-border)', borderRadius: 10, padding: '8px 12px', color: 'var(--text-1)', outline: 'none', resize: 'none', fontSize: 13, fontFamily: 'inherit', width: '100%' }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleSave} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          </div>
        </div>
      );
    }

    return <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 8, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.content}</p>;
  };

  return (
    <>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
      <div className="msg-enter" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ background: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: '16px 4px 16px 16px', padding: '12px 14px', width: 'fit-content', maxWidth: 'min(440px, 88%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-3)' }}><TypeIcon type={item.type} /></span>
              <span style={{ color: 'var(--text-1)', fontSize: 12, fontWeight: 600 }}>{item.title}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ color: 'var(--text-3)', fontSize: 10 }} className="mono">{formatTime(item.created_at)}</span>
              {item.type === 'note' && !editing && (
                <button onClick={() => setEditing(true)} style={{ fontSize: 10, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  onMouseOver={e => e.target.style.color = 'var(--text-1)'} onMouseOut={e => e.target.style.color = 'var(--text-3)'}>
                  edit
                </button>
              )}
              <button onClick={() => onDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}
                onMouseOver={e => e.currentTarget.style.color = '#ef4444'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-3)'}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
          {renderContent()}
        </div>
      </div>
    </>
  );
}