import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import useDesktopStore from '../../store/useDesktopStore';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mime = '') {
  if (mime.startsWith('image/')) return '🖼️';
  if (mime.startsWith('video/')) return '🎬';
  if (mime.startsWith('audio/')) return '🎵';
  if (mime.includes('pdf'))      return '📄';
  if (mime.includes('zip') || mime.includes('rar')) return '🗜️';
  if (mime.includes('text'))     return '📃';
  return '📎';
}

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [folder, setFolder] = useState('/');
  const [loading, setLoading] = useState(false);
  const [renaming, setRenaming] = useState(null); // file id
  const [renameVal, setRenameVal] = useState('');
  const [search, setSearch] = useState('');
  const [draggingOver, setDraggingOver] = useState(false);
  const fileInput = useRef();
  const { addNotification, theme } = useDesktopStore();
  const isDark = theme !== 'light';

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/files?folder=${folder}`);
      setFiles(data);
    } catch { addNotification('Failed to load files', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [folder]);

  const upload = async (fileList) => {
    for (const file of fileList) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      try {
        const { data } = await api.post('/files/upload', fd);
        setFiles(f => [data, ...f]);
        addNotification(`Uploaded ${file.name}`, 'success');
      } catch { addNotification(`Failed to upload ${file.name}`, 'error'); }
    }
  };

  const deleteFile = async (id) => {
    try {
      await api.delete(`/files/${id}`);
      setFiles(f => f.filter(x => x._id !== id));
      addNotification('File deleted', 'info');
    } catch { addNotification('Delete failed', 'error'); }
  };

  const rename = async (id) => {
    try {
      const { data } = await api.patch(`/files/${id}`, { name: renameVal });
      setFiles(f => f.map(x => x._id === id ? data : x));
      setRenaming(null);
    } catch { addNotification('Rename failed', 'error'); }
  };

  const filtered = files.filter(f =>
    f.originalName.toLowerCase().includes(search.toLowerCase())
  );

  const row = isDark ? 'hover:bg-white/5' : 'hover:bg-black/5';
  const border = isDark ? 'border-white/10' : 'border-black/10';
  const text = isDark ? 'text-slate-300' : 'text-slate-700';
  const muted = isDark ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`flex flex-col h-full ${isDark ? 'text-white' : 'text-slate-800'}`}>
      {/* Toolbar */}
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${border} shrink-0`}>
        <span className={`text-xs font-mono ${muted}`}>{folder}</span>
        <div className="flex-1" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search files..."
          className={`text-xs px-3 py-1.5 rounded-lg border ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-black/5 border-black/10 placeholder-slate-400'} focus:outline-none w-40`}
        />
        <button onClick={() => fileInput.current.click()}
          className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition">
          ⬆ Upload
        </button>
        <input ref={fileInput} type="file" multiple className="hidden"
          onChange={e => upload(Array.from(e.target.files))} />
      </div>

      {/* Drop zone + file list */}
      <div
        className={`flex-1 overflow-y-auto p-2 transition ${draggingOver ? 'bg-purple-500/10 ring-2 ring-purple-500 ring-inset' : ''}`}
        onDragOver={e => { e.preventDefault(); setDraggingOver(true); }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={e => { e.preventDefault(); setDraggingOver(false); upload(Array.from(e.dataTransfer.files)); }}
      >
        {loading && <div className={`text-center py-8 ${muted} text-sm`}>Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div className={`text-center py-16 ${muted}`}>
            <div className="text-4xl mb-3">📂</div>
            <p className="text-sm">Drop files here or click Upload</p>
          </div>
        )}
        {filtered.map(file => (
          <div key={file._id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${row} group transition`}>
            <span className="text-xl">{fileIcon(file.mimetype)}</span>
            <div className="flex-1 min-w-0">
              {renaming === file._id
                ? <input autoFocus value={renameVal}
                    onChange={e => setRenameVal(e.target.value)}
                    onBlur={() => rename(file._id)}
                    onKeyDown={e => e.key === 'Enter' && rename(file._id)}
                    className={`text-sm bg-transparent border-b ${isDark ? 'border-white/30 text-white' : 'border-black/30'} focus:outline-none w-full`}
                  />
                : <p className={`text-sm truncate ${text}`}>{file.originalName}</p>
              }
              <p className={`text-xs ${muted}`}>{formatSize(file.size)} · {new Date(file.createdAt).toLocaleDateString()}</p>
            </div>
            {/* Actions — show on hover */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
              <a href={file.path} download={file.originalName} target="_blank" rel="noreferrer"
                className={`text-xs px-2 py-1 rounded ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'} transition`}>
                ⬇
              </a>
              <button onClick={() => { setRenaming(file._id); setRenameVal(file.originalName); }}
                className={`text-xs px-2 py-1 rounded ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'} transition`}>
                ✏️
              </button>
              <button onClick={() => deleteFile(file._id)}
                className="text-xs px-2 py-1 rounded hover:bg-red-500/20 text-red-400 transition">
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className={`px-3 py-1.5 border-t ${border} text-xs ${muted} shrink-0`}>
        {files.length} item{files.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
