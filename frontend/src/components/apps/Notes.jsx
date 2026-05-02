import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useDesktopStore from '../../store/useDesktopStore';

const NOTE_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa'];

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null); // note object
  const [loading, setLoading] = useState(false);
  const { addNotification, theme } = useDesktopStore();
  const isDark = theme !== 'light';

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notes');
      setNotes(data);
      if (data.length > 0 && !selected) setSelected(data[0]);
    } catch { addNotification('Failed to load notes', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const createNote = async () => {
    try {
      const { data } = await api.post('/notes', { title: 'New Note', content: '' });
      setNotes(n => [data, ...n]);
      setSelected(data);
    } catch { addNotification('Failed to create note', 'error'); }
  };

  const saveNote = async (note) => {
    try {
      const { data } = await api.patch(`/notes/${note._id}`, { title: note.title, content: note.content, color: note.color });
      setNotes(n => n.map(x => x._id === data._id ? data : x));
    } catch { addNotification('Failed to save', 'error'); }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      const remaining = notes.filter(n => n._id !== id);
      setNotes(remaining);
      setSelected(remaining[0] || null);
      addNotification('Note deleted', 'info');
    } catch { addNotification('Delete failed', 'error'); }
  };

  const updateSelected = (field, value) => {
    const updated = { ...selected, [field]: value };
    setSelected(updated);
    setNotes(n => n.map(x => x._id === updated._id ? updated : x));
  };

  const border = isDark ? 'border-white/10' : 'border-black/10';
  const sidebarBg = isDark ? 'bg-slate-800/50' : 'bg-slate-100/80';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-black/5';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`flex h-full ${isDark ? 'text-white' : 'text-slate-800'}`}>
      {/* Sidebar */}
      <div className={`w-52 shrink-0 flex flex-col border-r ${border} ${sidebarBg}`}>
        <div className={`flex items-center justify-between px-3 py-2 border-b ${border}`}>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Notes</span>
          <button onClick={createNote}
            className="w-6 h-6 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-sm flex items-center justify-center transition">
            +
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {loading && <p className={`text-xs text-center py-4 ${muted}`}>Loading...</p>}
          {notes.map(note => (
            <button key={note._id}
              onClick={() => setSelected(note)}
              className={`w-full text-left px-3 py-2.5 transition ${hoverBg}
                ${selected?._id === note._id ? (isDark ? 'bg-white/10' : 'bg-black/10') : ''}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: note.color }} />
                <p className="text-sm font-medium truncate">{note.title || 'Untitled'}</p>
              </div>
              <p className={`text-xs ${muted} truncate mt-0.5 pl-4`}>
                {note.content?.slice(0, 40) || 'Empty note'}
              </p>
            </button>
          ))}
          {!loading && notes.length === 0 && (
            <p className={`text-xs text-center py-8 ${muted}`}>No notes yet</p>
          )}
        </div>
      </div>

      {/* Editor */}
      {selected ? (
        <div className="flex-1 flex flex-col">
          {/* Note toolbar */}
          <div className={`flex items-center gap-2 px-3 py-2 border-b ${border} shrink-0`}>
            <input
              value={selected.title}
              onChange={e => updateSelected('title', e.target.value)}
              onBlur={() => saveNote(selected)}
              className={`flex-1 text-sm font-semibold bg-transparent focus:outline-none ${isDark ? 'text-white' : 'text-slate-800'}`}
              placeholder="Note title..."
            />
            {/* Color picker */}
            <div className="flex gap-1">
              {NOTE_COLORS.map(c => (
                <button key={c} onClick={() => { updateSelected('color', c); saveNote({ ...selected, color: c }); }}
                  className={`w-4 h-4 rounded-full transition hover:scale-125 ${selected.color === c ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
            <button onClick={() => deleteNote(selected._id)}
              className="text-red-400 hover:text-red-300 text-sm transition px-1">🗑</button>
          </div>

          {/* Content area */}
          <textarea
            value={selected.content}
            onChange={e => updateSelected('content', e.target.value)}
            onBlur={() => saveNote(selected)}
            placeholder="Start writing..."
            className={`flex-1 p-4 resize-none focus:outline-none text-sm leading-relaxed bg-transparent
              ${isDark ? 'text-slate-200 placeholder-slate-600' : 'text-slate-700 placeholder-slate-400'}`}
          />

          <div className={`px-3 py-1.5 border-t ${border} text-xs ${muted} shrink-0`}>
            {selected.content?.length || 0} chars · saved
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex items-center justify-center ${muted}`}>
          <div className="text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-sm">Select a note or create one</p>
          </div>
        </div>
      )}
    </div>
  );
}
