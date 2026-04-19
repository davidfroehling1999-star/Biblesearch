// Sermon view — video player top-left, notes below, Bible panel on right.

function SermonView({ sermon: initialSermon, onBack, onUpdateSermon }) {
  const [sermon, setSermon] = React.useState(initialSermon);
  const [currentT, setCurrentT] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(initialSermon.durationSec || 0);
  const [notes, setNotes] = React.useState(initialSermon.notes);
  const [draft, setDraft] = React.useState("");
  const [bibleLookup, setBibleLookup] = React.useState(null);
  const [bibleQuery, setBibleQuery] = React.useState("");
  const [bibleLoading, setBibleLoading] = React.useState(false);
  const [recentRefs, setRecentRefs] = React.useState([]);
  const [popover, setPopover] = React.useState(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingTitle, setEditingTitle] = React.useState(false);

  const videoRef = React.useRef(null);
  const draftRef = React.useRef(null);

  function saveSermonMeta(updated) {
    setSermon(updated);
    onUpdateSermon && onUpdateSermon(updated);
  }

  function exportNotes() {
    if (!notes.length) return;
    const lines = [`# ${sermon.title}`, `${sermon.speaker} · ${sermon.date}`];
    if (sermon.series) lines.push(`*${sermon.series}*`);
    lines.push("", "---", "", "## Notes", "");
    for (const n of [...notes].sort((a, b) => a.t - b.t)) {
      lines.push(`**${fmtTime(n.t)}**${n.starred ? " ★" : ""} — ${n.text}`, "");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sermon.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + "-notes.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Collect Bible refs from notes asynchronously
  React.useEffect(() => {
    let cancelled = false;
    collectRefsFromNotesAsync(notes).then(refs => {
      if (!cancelled) setRecentRefs(refs);
    });
    return () => { cancelled = true; };
  }, [notes]);

  function seek(s) {
    const clamped = Math.max(0, Math.min(duration, s));
    setCurrentT(clamped);
    videoRef.current?.seekTo(clamped);
  }

  function handleDurationReady(d) {
    setDuration(d);
    if (d && sermon.durationSec !== d) {
      const updated = { ...sermon, durationSec: d, duration: fmtTime(d) };
      setSermon(updated);
      onUpdateSermon && onUpdateSermon(updated);
    }
  }

  function saveNotes(next) {
    setNotes(next);
    onUpdateSermon && onUpdateSermon({ ...sermon, notes: next });
  }

  function addNote() {
    if (!draft.trim()) return;
    const n = { id: "n" + Date.now(), t: Math.floor(currentT), text: draft.trim() };
    saveNotes([...notes, n].sort((a, b) => a.t - b.t));
    setDraft("");
  }

  function toggleStar(id) {
    saveNotes(notes.map(n => n.id === id ? { ...n, starred: !n.starred } : n));
  }

  function editNote(id, text) {
    saveNotes(notes.map(n => n.id === id ? { ...n, text } : n));
  }

  function deleteNote(id) {
    saveNotes(notes.filter(n => n.id !== id));
  }

  // Async ref hover — fetches passage from API if not in local cache
  async function handleRefHover(book, ch, vs, ve, targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    setPopover({ passage: null, loading: true, x, y });
    const passage = await lookupPassageAsync(book, ch, vs, ve);
    setPopover(passage ? { passage, loading: false, x, y } : null);
  }

  function handleRefLeave() {
    setTimeout(() => setPopover(null), 100);
  }

  function doBibleLookup(q) {
    setBibleQuery(q);
    setBibleLookup(null);
    if (!q.trim()) { setBibleLoading(false); return; }
    const re = new RegExp(BIBLE_REF_REGEX.source, "i");
    const m = q.match(re);
    if (m) {
      setBibleLoading(true);
      lookupPassageAsync(m[1], m[2], m[3], m[4]).then(p => {
        setBibleLookup(p);
        setBibleLoading(false);
      });
    } else {
      setBibleLoading(false);
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
          {editingTitle ? (
            <input
              className="sv-title sv-title-input"
              defaultValue={sermon.title}
              autoFocus
              onBlur={e => {
                if (e.target.value.trim()) saveSermonMeta({ ...sermon, title: e.target.value.trim() });
                setEditingTitle(false);
              }}
              onKeyDown={e => {
                if (e.key === "Enter") e.target.blur();
                if (e.key === "Escape") setEditingTitle(false);
              }}
            />
          ) : (
            <div className="sv-title sv-title-editable" onClick={() => setEditingTitle(true)} title="Click to rename">
              {sermon.title}
            </div>
          )}
        </div>
        <div className="sv-header-meta">
          <span>{sermon.speaker}</span>
          <span className="dot">·</span>
          <span>{sermon.date}</span>
          <button className="sv-edit-btn" onClick={() => setEditOpen(true)} title="Edit all sermon details">
            <Icon name="edit" size={12}/> Edit
          </button>
        </div>
      </header>

      {editOpen && (
        <EditSermonModal
          sermon={sermon}
          onSave={saveSermonMeta}
          onClose={() => setEditOpen(false)}
        />
      )}

      <div className="sv-main">
        {/* LEFT: video + notes */}
        <div className="sv-left">
          <VideoPlayer
            ref={videoRef}
            sermon={sermon}
            playing={playing}
            currentT={currentT}
            duration={duration}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={setCurrentT}
            onDurationReady={handleDurationReady}
            onSeek={seek}
            notes={notes}
          />
          <NotesPanel
            notes={notes}
            currentT={currentT}
            draft={draft}
            setDraft={setDraft}
            onAdd={addNote}
            onSeek={seek}
            onStar={toggleStar}
            onEdit={editNote}
            onDelete={deleteNote}
            onRefHover={handleRefHover}
            onRefLeave={handleRefLeave}
            onExport={exportNotes}
            draftRef={draftRef}
          />
        </div>

        {/* RIGHT: Bible reference panel */}
        <aside className="sv-right">
          <BiblePanel
            query={bibleQuery}
            onQueryChange={doBibleLookup}
            lookup={bibleLookup}
            loading={bibleLoading}
            recentRefs={recentRefs}
          />
        </aside>
      </div>

      {popover && <RefPopover passage={popover.passage} loading={popover.loading} x={popover.x} y={popover.y}/>}
    </div>
  );
}

async function collectRefsFromNotesAsync(notes) {
  const found = [];
  const seen = new Set();
  for (const n of notes) {
    const re = new RegExp(BIBLE_REF_REGEX.source, "gi");
    let m;
    while ((m = re.exec(n.text)) !== null) {
      const p = await lookupPassageAsync(m[1], m[2], m[3], m[4]);
      if (p && !seen.has(p.ref)) {
        seen.add(p.ref);
        found.push(p);
      }
    }
  }
  return found;
}

// ---- YouTube IFrame API bootstrap ----
// Ensures window._ytReady resolves whenever the API is available.
(function () {
  if (window._ytReady) return;
  window._ytReady = new Promise(resolve => {
    if (window.YT && window.YT.Player) { resolve(); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (prev) prev();
      resolve();
    };
  });
  if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
})();

// ---------------- VIDEO PLAYER ----------------

const VideoPlayer = React.forwardRef(function VideoPlayer(
  { sermon, playing, currentT, duration, onPlay, onPause, onTimeUpdate, onDurationReady, onSeek, notes },
  ref
) {
  const containerRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const playingRef = React.useRef(playing);
  const [ytReady, setYtReady] = React.useState(false);

  playingRef.current = playing;

  // Wait for YouTube IFrame API to be ready
  React.useEffect(() => {
    window._ytReady.then(() => setYtReady(true));
  }, []);

  // Create player when API ready or video ID changes
  React.useEffect(() => {
    if (!ytReady || !sermon.youtubeId || !containerRef.current) return;

    // Insert a fresh div for this player instance
    containerRef.current.innerHTML = "";
    const div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    containerRef.current.appendChild(div);

    const player = new YT.Player(div, {
      videoId: sermon.youtubeId,
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 0,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        fs: 0,
        disablekb: 1,
      },
      events: {
        onReady(e) {
          const dur = e.target.getDuration();
          if (dur) onDurationReady(dur);
          if (playingRef.current) e.target.playVideo();
        },
        onStateChange(e) {
          if (e.data === YT.PlayerState.PLAYING && !playingRef.current) onPlay();
          if ((e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) && playingRef.current) onPause();
        },
      },
    });
    playerRef.current = player;

    return () => {
      try { player.destroy(); } catch (err) {}
      playerRef.current = null;
    };
  }, [ytReady, sermon.youtubeId]);

  // Sync play/pause prop changes to real player
  React.useEffect(() => {
    const p = playerRef.current;
    if (!p || typeof p.getPlayerState !== "function") return;
    if (playing && p.getPlayerState() !== YT.PlayerState.PLAYING) p.playVideo();
    if (!playing && p.getPlayerState() === YT.PlayerState.PLAYING) p.pauseVideo();
  }, [playing]);

  // Poll current time from real player while playing
  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (p?.getCurrentTime) onTimeUpdate(Math.floor(p.getCurrentTime()));
    }, 500);
    return () => clearInterval(id);
  }, [playing]);

  // Expose seekTo for parent (note timestamp clicks, scrub)
  React.useImperativeHandle(ref, () => ({
    seekTo(t) { playerRef.current?.seekTo(t, true); },
  }));

  const hasYt = !!sermon.youtubeId;
  const showRealPlayer = hasYt && ytReady;
  const pct = duration ? (currentT / duration) * 100 : 0;
  const trackRef = React.useRef(null);

  function handleScrub(e) {
    const rect = trackRef.current.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(frac * duration);
  }

  const thumbBg = sermon.thumbUrl
    ? { backgroundImage: `url(${sermon.thumbUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: sermon.thumbColor || "#5a4a3a" };

  return (
    <div className="vp">
      <div className="vp-stage">
        {/* Real YouTube player container — always mounted so API can attach */}
        <div
          ref={containerRef}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            display: showRealPlayer ? "block" : "none",
          }}
        />

        {/* Faux surface until real player is ready */}
        {!showRealPlayer && (
          <div className="vp-faux" style={thumbBg}>
            <div className="vp-faux-grain"/>
            <div className="vp-faux-content">
              <div className="vp-faux-tape">LIVE FROM {sermon.series.toUpperCase()}</div>
              <div className="vp-faux-title">{sermon.title}</div>
              <div className="vp-faux-speaker">{sermon.speaker}</div>
              {hasYt && !ytReady && (
                <div className="vp-faux-ytlabel">
                  <Icon name="youtube" size={12}/> Loading player…
                </div>
              )}
            </div>
          </div>
        )}

        {/* Big play button overlay */}
        {!playing && (
          <button className="vp-bigplay" onClick={onPlay} aria-label="Play" style={{ zIndex: 10 }}>
            <Icon name="play" size={28}/>
          </button>
        )}
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
          {duration > 0 && notes.map(n => (
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
});

Object.assign(window, { SermonView, VideoPlayer });
