// Library view — the landing page. Lists sermons; paste-URL modal for YouTube import.

function LibraryView({ sermons, onOpen, onImport, theme, setTheme }) {
  const [query, setQuery] = React.useState("");
  const [importOpen, setImportOpen] = React.useState(false);

  const filtered = sermons.filter(s => {
    const q = query.toLowerCase();
    return !q || s.title.toLowerCase().includes(q) ||
           s.speaker.toLowerCase().includes(q) ||
           s.series.toLowerCase().includes(q);
  });

  return (
    <div className="library">
      <header className="lib-header">
        <div className="lib-brand">
          <div className="lib-mark">M</div>
          <div>
            <div className="lib-brand-name">Marginalia</div>
            <div className="lib-brand-tag">Sermon notes, in the margin</div>
          </div>
        </div>
        <div className="lib-header-right">
          <div className="lib-search">
            <Icon name="search" size={14} />
            <input
              placeholder="Search sermons, speakers, series…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button className="lib-import-btn" onClick={() => setImportOpen(true)}>
            <Icon name="plus" size={14} /> Import sermon
          </button>
        </div>
      </header>

      <div className="lib-hero">
        <div className="lib-hero-eyebrow">Sunday, April 19 · 4th after Easter</div>
        <h1 className="lib-hero-title">
          Listen carefully.<br/>
          <em>Write in the margin.</em>
        </h1>
        <p className="lib-hero-sub">
          Bring a sermon from YouTube, mark the moments that catch you,
          and let the text meet the text.
        </p>
      </div>

      <div className="lib-section-head">
        <h2>Your library</h2>
        <span className="lib-count">{filtered.length} sermons</span>
      </div>

      <div className="lib-grid">
        {filtered.map(s => (
          <SermonCard key={s.id} sermon={s} onClick={() => onOpen(s)} />
        ))}
        <button className="lib-card lib-card--add" onClick={() => setImportOpen(true)}>
          <div className="lib-card-add-inner">
            <Icon name="plus" size={20} />
            <div>Import a sermon</div>
            <div className="lib-card-add-sub">Paste a YouTube URL</div>
          </div>
        </button>
      </div>

      <footer className="lib-foot">
        <span>Marginalia — a quiet place for Sunday notes.</span>
        <span className="lib-foot-sep">·</span>
        <span>WEB translation, public domain</span>
      </footer>

      {importOpen && (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onImport={(data) => { onImport(data); setImportOpen(false); }}
        />
      )}
    </div>
  );
}

function SermonCard({ sermon, onClick }) {
  const thumbStyle = sermon.thumbUrl
    ? { backgroundImage: `url(${sermon.thumbUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: sermon.thumbColor || "#8B6F47" };

  return (
    <button className="lib-card" onClick={onClick}>
      <div className="lib-card-thumb" style={thumbStyle}>
        <div className="lib-card-thumb-tape">{sermon.series}</div>
        <div className="lib-card-thumb-title">{sermon.title}</div>
        <div className="lib-card-thumb-dur">{sermon.duration}</div>
      </div>
      <div className="lib-card-body">
        <div className="lib-card-speaker">{sermon.speaker}</div>
        <div className="lib-card-date">{sermon.date}</div>
        <div className="lib-card-meta">
          {sermon.notes.length
            ? <span><Icon name="notes" size={11}/> {sermon.notes.length} notes</span>
            : <span className="lib-card-meta--empty">No notes yet</span>}
          {sermon.notes.some(n => n.starred) && <span><Icon name="starFill" size={11}/></span>}
        </div>
      </div>
    </button>
  );
}

function ImportModal({ onClose, onImport }) {
  const [url, setUrl] = React.useState("");
  const [parsing, setParsing] = React.useState(false);
  const [error, setError] = React.useState("");

  function parseYouTubeId(u) {
    try {
      const m1 = u.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{6,})/);
      if (m1) return m1[1];
      if (/^[A-Za-z0-9_-]{6,}$/.test(u.trim())) return u.trim();
    } catch (e) {}
    return null;
  }

  async function submit() {
    setError("");
    const id = parseYouTubeId(url);
    if (!id) { setError("Hmm — that doesn't look like a YouTube link."); return; }
    setParsing(true);

    try {
      const resp = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
      );
      if (!resp.ok) throw new Error("not found");
      const meta = await resp.json();

      onImport({
        id: "imported-" + Date.now(),
        title: meta.title || "Imported Sermon",
        speaker: meta.author_name || "Unknown Speaker",
        series: "Imported",
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        duration: "—",
        durationSec: 0,
        youtubeId: id,
        thumbUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        thumbColor: null,
        outline: [
          { t: 0, label: "Opening" },
          { t: 300, label: "Scripture reading" },
          { t: 900, label: "Main point" },
          { t: 1500, label: "Application" },
        ],
        notes: [],
      });
    } catch {
      setError("Couldn't load video info — check the URL and try again.");
      setParsing(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">
            <Icon name="youtube" size={18}/> Import from YouTube
          </div>
          <button className="modal-close" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body">
          <label className="modal-label">Paste a YouTube sermon link</label>
          <div className="modal-input-row">
            <input
              autoFocus
              className="modal-input"
              placeholder="https://youtube.com/watch?v=…"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
            />
          </div>
          {error && <div className="modal-err">{error}</div>}
          <div className="modal-hint">
            Works with watch URLs, <code>youtu.be</code> short links, and embeds.
            We'll pull the title and channel name automatically.
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={parsing || !url}>
            {parsing ? "Loading…" : "Import sermon"}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LibraryView, SermonCard, ImportModal });
