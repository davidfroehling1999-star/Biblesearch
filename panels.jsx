// Notes panel, Bible panel, Outline panel, and the floating ref popover.

// ---------------- NOTES PANEL ----------------

function NotesPanel({ notes, currentT, draft, setDraft, onAdd, onSeek, onStar, onEdit, onDelete, onRefHover, onRefLeave, draftRef }) {
  const [editingId, setEditingId] = React.useState(null);
  const [editText, setEditText] = React.useState("");

  function startEdit(n) {
    setEditingId(n.id);
    setEditText(n.text);
  }
  function commitEdit() {
    if (editingId) onEdit(editingId, editText);
    setEditingId(null);
  }

  // Group notes by rough "section" — same minute buckets feel paper-like.
  return (
    <section className="np">
      <div className="np-head">
        <div className="np-head-left">
          <h3>Margin notes</h3>
          <span className="np-count">{notes.length}</span>
        </div>
        <div className="np-head-hint">
          <Icon name="book" size={12}/> Type a verse like <em>John 3:16</em> for an inline preview
        </div>
      </div>

      <div className="np-composer">
        <div className="np-composer-time" title="Timestamp when you hit save">
          <div className="np-dot"/>
          <span>{fmtTime(currentT)}</span>
        </div>
        <textarea
          ref={draftRef}
          className="np-composer-input"
          placeholder="What did you hear? A verse, a question, a phrase to carry home…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onAdd(); }
          }}
          rows={2}
        />
        <button className="np-composer-save" onClick={onAdd} disabled={!draft.trim()}>
          Save note
          <span className="np-composer-hint">⌘↵</span>
        </button>
      </div>

      {notes.length === 0 && (
        <div className="np-empty">
          <div className="np-empty-rule"/>
          <div className="np-empty-text">
            The margins are blank.<br/>
            Press play, and write the first thing that catches.
          </div>
          <div className="np-empty-rule"/>
        </div>
      )}

      <ol className="np-list">
        {notes.map(n => {
          const isEditing = editingId === n.id;
          return (
            <li key={n.id} className={"np-item" + (n.starred ? " is-starred" : "")}>
              <button
                className="np-item-time"
                onClick={() => onSeek(n.t)}
                title="Jump to this moment"
              >
                {fmtTime(n.t)}
              </button>
              <div className="np-item-body">
                {isEditing ? (
                  <textarea
                    className="np-item-edit"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={e => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commitEdit(); }
                      if (e.key === "Escape") { setEditingId(null); }
                    }}
                    autoFocus
                    rows={Math.max(2, editText.split("\n").length)}
                  />
                ) : (
                  <p className="np-item-text" onClick={() => startEdit(n)}>
                    <AnnotatedText text={n.text} onRefHover={onRefHover} onRefLeave={onRefLeave}/>
                  </p>
                )}
              </div>
              <div className="np-item-actions">
                <button
                  className={"np-item-star" + (n.starred ? " active" : "")}
                  onClick={() => onStar(n.id)}
                  aria-label="Star note"
                ><Icon name={n.starred ? "starFill" : "star"} size={13}/></button>
                <button
                  className="np-item-del"
                  onClick={() => onDelete(n.id)}
                  aria-label="Delete note"
                ><Icon name="x" size={13}/></button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ---------------- BIBLE PANEL ----------------

function BiblePanel({ query, onQueryChange, lookup, loading, recentRefs }) {
  const suggestions = [
    "John 3:16", "Romans 8:28", "Psalm 23:1-4", "Matthew 5:3-10",
    "Philippians 4:6-7", "Ephesians 2:8-10", "1 Corinthians 13:4-7",
    "Galatians 5:22-23", "Hebrews 11:1", "Isaiah 40:31"
  ];

  return (
    <div className="bp">
      <div className="bp-head">
        <div className="bp-title">
          <span className="bp-title-main">The Scriptures</span>
          <span className="bp-title-sub">World English Bible · public domain</span>
        </div>
      </div>

      <div className="bp-search">
        <Icon name="search" size={13}/>
        <input
          placeholder="Look up a passage — John 3:16"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="bp-miss" style={{ fontStyle: "italic", color: "var(--ink-faint)" }}>
          Looking up passage…
        </div>
      ) : lookup ? (
        <PassageBlock passage={lookup} emphasized/>
      ) : query ? (
        <div className="bp-miss">
          <em>No passage found for "{query}".</em>
          <div className="bp-miss-hint">Try a format like <code>John 3:16</code> or <code>Psalm 23:1-4</code>.</div>
        </div>
      ) : (
        <>
          {recentRefs.length > 0 && (
            <div className="bp-section">
              <div className="bp-section-head">Referenced in your notes</div>
              {recentRefs.map(p => (
                <PassageBlock key={p.ref} passage={p}/>
              ))}
            </div>
          )}
          <div className="bp-section">
            <div className="bp-section-head">Quick lookup</div>
            <div className="bp-suggest">
              {suggestions.map(s => (
                <button key={s} className="bp-suggest-btn" onClick={() => onQueryChange(s)}>{s}</button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PassageBlock({ passage, emphasized }) {
  return (
    <blockquote className={"passage" + (emphasized ? " passage--emph" : "")}>
      <div className="passage-ref">{passage.ref}</div>
      <div className="passage-text">{passage.text}</div>
      <div className="passage-ver">{passage.version}</div>
    </blockquote>
  );
}

// ---------------- OUTLINE PANEL ----------------

function OutlinePanel({ sermon, currentT, onJump }) {
  const activeIdx = (() => {
    let idx = -1;
    for (let i = 0; i < sermon.outline.length; i++) {
      if (sermon.outline[i].t <= currentT) idx = i;
    }
    return idx;
  })();

  return (
    <div className="op">
      <div className="op-head">
        <div className="op-title">
          <span className="op-title-main">Auto-outline</span>
          <span className="op-title-sub"><Icon name="sparkle" size={11}/> Generated from transcript</span>
        </div>
      </div>

      <ol className="op-list">
        {sermon.outline.map((o, i) => {
          const isActive = i === activeIdx;
          return (
            <li
              key={i}
              className={"op-item" + (isActive ? " active" : "") + (i < activeIdx ? " past" : "")}
              onClick={() => onJump(o.t)}
            >
              <div className="op-item-rail">
                <div className="op-item-dot"/>
              </div>
              <div className="op-item-body">
                <div className="op-item-time">{fmtTime(o.t)}</div>
                <div className="op-item-label">{o.label}</div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="op-foot">
        <Icon name="sparkle" size={11}/> Click any section to jump the video.
      </div>
    </div>
  );
}

// ---------------- REF POPOVER ----------------

function RefPopover({ passage, loading, x, y }) {
  const w = 340;
  const px = Math.max(12, Math.min(window.innerWidth - w - 12, x - w / 2));
  return (
    <div className="ref-pop" style={{ left: px, top: y - 12, width: w, transform: "translateY(-100%)" }}>
      <div className="ref-pop-arrow" style={{ left: x - px }}/>
      {loading ? (
        <div className="ref-pop-text" style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>
          Looking up…
        </div>
      ) : passage ? (
        <>
          <div className="ref-pop-ref">{passage.ref}</div>
          <div className="ref-pop-text">{passage.text}</div>
          <div className="ref-pop-ver">{passage.version}</div>
        </>
      ) : null}
    </div>
  );
}

Object.assign(window, { NotesPanel, BiblePanel, PassageBlock, OutlinePanel, RefPopover });
