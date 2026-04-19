// Shared UI primitives — icons, small buttons, passage popover.

const PAPER = {
  // Will be overridden at runtime by theme CSS vars.
};

function Icon({ name, size = 16, stroke = 1.6, style = {} }) {
  const s = size;
  const sw = stroke;
  const common = {
    width: s, height: s, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round",
    style
  };
  switch (name) {
    case "play": return <svg {...common}><polygon points="6 4 20 12 6 20" fill="currentColor" stroke="none"/></svg>;
    case "pause": return <svg {...common}><rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none"/></svg>;
    case "back10": return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7"/><polyline points="3 4 3 10 9 10"/></svg>;
    case "fwd10": return <svg {...common}><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 4 21 10 15 10"/></svg>;
    case "book": return <svg {...common}><path d="M4 4h10a4 4 0 0 1 4 4v12H8a4 4 0 0 0-4 4V4z"/><path d="M4 4v16"/></svg>;
    case "library": return <svg {...common}><path d="M4 5v14M8 5v14M13 5l5 14M19 4l-1.5.5"/></svg>;
    case "plus": return <svg {...common}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case "star": return <svg {...common}><polygon points="12 2 15 9 22 9.3 16.5 13.8 18.5 21 12 17 5.5 21 7.5 13.8 2 9.3 9 9"/></svg>;
    case "starFill": return <svg {...common}><polygon points="12 2 15 9 22 9.3 16.5 13.8 18.5 21 12 17 5.5 21 7.5 13.8 2 9.3 9 9" fill="currentColor"/></svg>;
    case "search": return <svg {...common}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>;
    case "x": return <svg {...common}><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>;
    case "youtube": return <svg {...common}><rect x="2" y="6" width="20" height="12" rx="3"/><polygon points="10 9 15 12 10 15" fill="currentColor" stroke="none"/></svg>;
    case "outline": return <svg {...common}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none"/></svg>;
    case "notes": return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/></svg>;
    case "chevron": return <svg {...common}><polyline points="9 6 15 12 9 18"/></svg>;
    case "sparkle": return <svg {...common}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>;
    case "settings": return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>;
    default: return null;
  }
}

function fmtTime(s) {
  s = Math.max(0, Math.floor(s));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

// Render text with Bible refs highlighted + hoverable.
function AnnotatedText({ text, onRefHover, onRefLeave }) {
  const parts = [];
  const re = new RegExp(BIBLE_REF_REGEX.source, "gi");
  let last = 0;
  let m;
  let idx = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [full, book, ch, vs, ve] = m;
    const passage = lookupPassage(book, ch, vs, ve);
    parts.push(
      <span
        key={idx++}
        className={"bible-ref" + (passage ? "" : " bible-ref--unknown")}
        onMouseEnter={(e) => passage && onRefHover && onRefHover(passage, e.currentTarget)}
        onMouseLeave={() => onRefLeave && onRefLeave()}
      >{full}</span>
    );
    last = m.index + full.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

Object.assign(window, { Icon, fmtTime, AnnotatedText });
