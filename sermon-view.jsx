// Sermon view — video player top-left, notes below, Bible panel on right.

function SermonView({ sermon, onBack, onUpdateSermon }) {
  const [currentT, setCurrentT] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(sermon.durationSec || 0);
  const [notes, setNotes] = React.useState(sermon.notes);
  const [draft, setDraft] = React.useState("");
  const [hoverPassage, setHoverPassage] = React.useState(null);
  const [rightTab, setRightTab] = React.useState("bible"); // "bible" | "outline"
  const [bibleLookup, setBibleLookup] = React.useState(null);
  const [bibleQuery, setBibleQuery] = React.useState("");

  const playerRef = React.useRef(null);
  const tickRef = React.useRef(null);
  const draftRef = React.useRef(null);

  // Simulated time ticker (YouTube iframe API would be used in production).
  React.useEffect(() => {
    if (playing) {
      tickRef.current = setInterval(() => {
        setCurrentT(t => {
          const next = t + 1;
          return next >= duration ? duration : next;
        });
      }, 1000);
    } else if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    return () => tickRef.current && clearInterval(tickRef.current);
  }, [playing, duration]);

  function seek(s) {
    setCurrentT(Math.max(0, Math.min(duration, s)));
  }

  function addNote() {
    if (!draft.trim()) return;
    const n = { id: "n" + Date.now(), t: Math.floor(currentT), text: draft.trim() };
    const next = [...notes, n].sort((a,b) => a.t - b.t);
    setNotes(next);
    setDraft("");
    onUpdateSermon && onUpdateSermon({ ...sermon, notes: next });
  }

  function toggleStar(id) {
    const next = notes.map(n => n.id === id ? { ...n, starred: !n.starred } : n);
    setNotes(next);
    onUpdateSermon && onUpdateSermon({ ...sermon, notes: next });
  }

  function editNote(id, text) {
    const next = notes.map(n => n.id === id ? { ...n, text } : n);
    setNotes(next);
    onUpdateSermon && onUpdateSermon({ ...sermon, notes: next });
  }

  function deleteNote(id) {
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    onUpdateSermon && onUpdateSermon({ ...sermon, notes: next });
  }

  // Bible ref hover
  const [popover, setPopover] = React.useState(null);
  function handleRefHover(passage, targetEl) {
    const rect = targetEl.getBoundingClientRect();
    setPopover({ passage, x: rect.left + rect.width / 2, y: rect.top });
  }
  function handleRefLeave() {
    setTimeout(() => setPopover(null), 100);
  }

  // Bible panel lookup
  function doBibleLookup(q) {
    setBibleQuery(q);
    const re = new RegExp(BIBLE_REF_REGEX.source, "i");
    const m = q.match(re);
    if (m) {
      const p = lookupPassage(m[1], m[2], m[3], m[4]);
      setBibleLookup(p);
    } else {
      setBibleLookup(null);
    }
  }

  return (
    <div className="sermon-view">
      <header className="sv-header">
        <button className="sv-back" onClick={onBack}>
          <Icon name="library" size={14}/> Library
        </button>
        <div className="sv-header-title">
          <div className="sv-series">{sermon.series}</div>
          <div className="sv-title">{sermon.title}</div>
        </div>
        <div className="sv-header-meta">
          <span>{sermon.speaker}</span>
          <span className="dot">·</span>
          <span>{sermon.date}</span>
        </div>
      </header>

      <div className="sv-main">
        {/* LEFT: video + notes */}
        <div className="sv-left">
          <VideoPlayer
            sermon={sermon}
            playing={playing}
            currentT={currentT}
            duration={duration}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onSeek={seek}
            notes={notes}
          />
          <NotesPanel
            notes={notes}
            currentT={currentT}
            draft={draft}
            setDraft={setDraft}
            onAdd={addNote}
            onSeek={(t) => { seek(t); }}
            onStar={toggleStar}
            onEdit={editNote}
            onDelete={deleteNote}
            onRefHover={handleRefHover}
            onRefLeave={handleRefLeave}
            draftRef={draftRef}
          />
        </div>

        {/* RIGHT: Bible / outline */}
        <aside className="sv-right">
          <div className="sv-right-tabs">
            <button
              className={"sv-tab" + (rightTab === "bible" ? " active" : "")}
              onClick={() => setRightTab("bible")}
            ><Icon name="book" size={13}/> Bible</button>
            <button
              className={"sv-tab" + (rightTab === "outline" ? " active" : "")}
              onClick={() => setRightTab("outline")}
            ><Icon name="outline" size={13}/> Outline</button>
          </div>
          {rightTab === "bible" ? (
            <BiblePanel
              query={bibleQuery}
              onQueryChange={doBibleLookup}
              lookup={bibleLookup}
              recentRefs={collectRefsFromNotes(notes)}
            />
          ) : (
            <OutlinePanel sermon={sermon} currentT={currentT} onJump={seek}/>
          )}
        </aside>
      </div>

      {popover && <RefPopover passage={popover.passage} x={popover.x} y={popover.y}/>}
    </div>
  );
}

function collectRefsFromNotes(notes) {
  const found = [];
  const seen = new Set();
  for (const n of notes) {
    const re = new RegExp(BIBLE_REF_REGEX.source, "gi");
    let m;
    while ((m = re.exec(n.text)) !== null) {
      const p = lookupPassage(m[1], m[2], m[3], m[4]);
      if (p && !seen.has(p.ref)) {
        seen.add(p.ref);
        found.push(p);
      }
    }
  }
  return found;
}

// ---------------- VIDEO PLAYER ----------------

function VideoPlayer({ sermon, playing, currentT, duration, onPlay, onPause, onSeek, notes }) {
  const pct = duration ? (currentT / duration) * 100 : 0;
  const trackRef = React.useRef(null);

  function handleScrub(e) {
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const p = Math.max(0, Math.min(1, x / rect.width));
    onSeek(p * duration);
  }

  return (
    <div className="vp">
      <div className="vp-stage">
        {/* Faux video surface — stays in-iframe (no external calls). */}
        <div className="vp-faux" style={{ background: sermon.thumbColor }}>
          <div className="vp-faux-grain"/>
          <div className="vp-faux-content">
            <div className="vp-faux-tape">LIVE FROM {sermon.series.toUpperCase()}</div>
            <div className="vp-faux-title">{sermon.title}</div>
            <div className="vp-faux-speaker">{sermon.speaker}</div>
            <div className="vp-faux-ytlabel">
              <Icon name="youtube" size={12}/> youtube.com/watch?v={sermon.youtubeId}
            </div>
          </div>
          {!playing && (
            <button className="vp-bigplay" onClick={onPlay} aria-label="Play">
              <Icon name="play" size={28}/>
            </button>
          )}
        </div>
      </div>

      <div className="vp-controls">
        <button className="vp-ctrl" onClick={() => onSeek(currentT - 10)} aria-label="Back 10s">
          <Icon name="back10" size={18}/>
        </button>
        <button className="vp-ctrl vp-ctrl--main" onClick={() => playing ? onPause() : onPlay()}>
          <Icon name={playing ? "pause" : "play"} size={18}/>
        </button>
        <button className="vp-ctrl" onClick={() => onSeek(currentT + 10)} aria-label="Forward 10s">
          <Icon name="fwd10" size={18}/>
        </button>
        <div className="vp-time">{fmtTime(currentT)}</div>
        <div className="vp-track" ref={trackRef} onClick={handleScrub}>
          <div className="vp-track-bg"/>
          <div className="vp-track-fill" style={{ width: pct + "%" }}/>
          {notes.map(n => (
            <div
              key={n.id}
              className="vp-track-marker"
              style={{ left: (n.t / duration) * 100 + "%" }}
              title={n.text}
            />
          ))}
          <div className="vp-track-thumb" style={{ left: pct + "%" }}/>
        </div>
        <div className="vp-time vp-time--total">{fmtTime(duration)}</div>
      </div>
    </div>
  );
}

Object.assign(window, { SermonView, VideoPlayer });
