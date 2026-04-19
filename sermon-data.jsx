// Seed data for the sermon library, notes, and auto-generated outlines.
// Times are in seconds.

const SERMONS = [
  {
    id: "grace-abounding",
    title: "Grace Abounding",
    speaker: "Rev. Thomas Whitfield",
    series: "Sunday Morning · Ephesians",
    date: "April 13, 2026",
    duration: "42:18",
    durationSec: 2538,
    // public-domain-safe demo video (NASA livestream archive). This is just a visual mock.
    youtubeId: "21X5lGlDOfg",
    thumbColor: "#B85C3A",
    outline: [
      { t: 12, label: "Invocation & welcome" },
      { t: 94, label: "Reading: Ephesians 2:8–10" },
      { t: 212, label: "I. What grace is not" },
      { t: 486, label: "II. The gift we cannot earn" },
      { t: 812, label: "III. Created for good works" },
      { t: 1240, label: "Illustration: the borrowed coat" },
      { t: 1620, label: "Application & closing prayer" }
    ],
    notes: [
      { id: "n1", t: 96, text: "Reading today — Ephesians 2:8-10. Note how Paul frames salvation as a gift." },
      { id: "n2", t: 248, text: "Grace is not a reward we clocked in to receive. It is not a transaction." },
      { id: "n3", t: 502, text: "\"For by grace you have been saved through faith\" — the faith itself is the gift, not only what it lays hold of." },
      { id: "n4", t: 834, text: "We are his workmanship — ποίημα, where we get the word poem. We are being written.", starred: true },
      { id: "n5", t: 1258, text: "The borrowed coat illustration: a child wearing her father's coat in a storm. Warmth isn't hers, but it covers her completely." },
      { id: "n6", t: 1642, text: "Q: where am I still trying to earn what I've already been given? (See Romans 8:28.)" }
    ]
  },
  {
    id: "sermon-on-the-mount",
    title: "The Upside-Down Kingdom",
    speaker: "Pastor Marian Okafor",
    series: "Sermon on the Mount · Pt. 3",
    date: "April 6, 2026",
    duration: "38:02",
    durationSec: 2282,
    youtubeId: "DoHPLuC78i0",
    thumbColor: "#6E7F4E",
    outline: [
      { t: 8, label: "Call to worship" },
      { t: 62, label: "Reading: Matthew 5:3–10" },
      { t: 180, label: "Blessed are the poor in spirit" },
      { t: 540, label: "Blessed are those who mourn" },
      { t: 960, label: "Blessed are the gentle" },
      { t: 1380, label: "Hunger & thirst after righteousness" },
      { t: 1820, label: "Closing: a different kind of blessed" }
    ],
    notes: [
      { id: "n1", t: 64, text: "Matthew 5:3-10 — the Beatitudes. Each begins with \"blessed,\" μακάριος — flourishing, happy in a deep sense." },
      { id: "n2", t: 210, text: "Poor in spirit = spiritually bankrupt. The starting posture of the kingdom is empty hands." },
      { id: "n3", t: 574, text: "Mourning over our own sin and the world's — the Spirit's comfort presupposes our grief.", starred: true },
      { id: "n4", t: 1004, text: "Gentleness is not weakness. Strength under control. See Proverbs 3:5-6." }
    ]
  },
  {
    id: "valley-of-the-shadow",
    title: "Through the Valley",
    speaker: "Rev. Thomas Whitfield",
    series: "Psalms for the Weary",
    date: "March 30, 2026",
    duration: "35:41",
    durationSec: 2141,
    youtubeId: "Wch3gJG2GJ4",
    thumbColor: "#4A5F7A",
    outline: [
      { t: 10, label: "Opening prayer" },
      { t: 80, label: "Psalm 23 in context" },
      { t: 420, label: "Shepherd / King imagery" },
      { t: 900, label: "Walking through, not around" },
      { t: 1400, label: "The rod and the staff" },
      { t: 1800, label: "Dwelling in the house forever" }
    ],
    notes: [
      { id: "n1", t: 92, text: "Psalm 23:1-4 — David writes as one who has been both shepherd and hunted." },
      { id: "n2", t: 932, text: "\"Walk through\" — not around, not over. The valley is on the path, not off it.", starred: true }
    ]
  },
  {
    id: "love-that-will-not",
    title: "The Love That Will Not Let You Go",
    speaker: "Pastor Marian Okafor",
    series: "1 Corinthians",
    date: "March 23, 2026",
    duration: "44:07",
    durationSec: 2647,
    youtubeId: "k85mRPqvMbE",
    thumbColor: "#A04848",
    outline: [
      { t: 0, label: "Welcome" },
      { t: 120, label: "Reading: 1 Corinthians 13:4–7" },
      { t: 360, label: "What love is not" },
      { t: 900, label: "Love bears, believes, hopes, endures" },
      { t: 1600, label: "Faith, hope, love — and the greatest" },
      { t: 2200, label: "Benediction" }
    ],
    notes: []
  }
];

Object.assign(window, { SERMONS });
