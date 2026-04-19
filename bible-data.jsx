// Curated WEB (World English Bible, public domain) passages for inline preview.
// Keys are normalized: "book chapter:verse" or "book chapter:verse-verse".

const BIBLE_PASSAGES = {
  "john 3:16": {
    ref: "John 3:16",
    text: "For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.",
    version: "WEB"
  },
  "john 3:16-17": {
    ref: "John 3:16–17",
    text: "For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life. For God didn't send his Son into the world to judge the world, but that the world should be saved through him.",
    version: "WEB"
  },
  "romans 8:28": {
    ref: "Romans 8:28",
    text: "We know that all things work together for good for those who love God, for those who are called according to his purpose.",
    version: "WEB"
  },
  "romans 8:38-39": {
    ref: "Romans 8:38–39",
    text: "For I am persuaded that neither death, nor life, nor angels, nor principalities, nor things present, nor things to come, nor powers, nor height, nor depth, nor any other created thing will be able to separate us from God's love which is in Christ Jesus our Lord.",
    version: "WEB"
  },
  "matthew 5:3": {
    ref: "Matthew 5:3",
    text: "Blessed are the poor in spirit, for theirs is the Kingdom of Heaven.",
    version: "WEB"
  },
  "matthew 5:3-10": {
    ref: "Matthew 5:3–10",
    text: "Blessed are the poor in spirit, for theirs is the Kingdom of Heaven. Blessed are those who mourn, for they shall be comforted. Blessed are the gentle, for they shall inherit the earth. Blessed are those who hunger and thirst after righteousness, for they shall be filled. Blessed are the merciful, for they shall obtain mercy. Blessed are the pure in heart, for they shall see God. Blessed are the peacemakers, for they shall be called children of God. Blessed are those who have been persecuted for righteousness' sake, for theirs is the Kingdom of Heaven.",
    version: "WEB"
  },
  "philippians 4:6-7": {
    ref: "Philippians 4:6–7",
    text: "In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus.",
    version: "WEB"
  },
  "philippians 4:13": {
    ref: "Philippians 4:13",
    text: "I can do all things through Christ, who strengthens me.",
    version: "WEB"
  },
  "psalm 23:1": {
    ref: "Psalm 23:1",
    text: "Yahweh is my shepherd; I shall lack nothing.",
    version: "WEB"
  },
  "psalm 23:1-4": {
    ref: "Psalm 23:1–4",
    text: "Yahweh is my shepherd; I shall lack nothing. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He guides me in the paths of righteousness for his name's sake. Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.",
    version: "WEB"
  },
  "1 corinthians 13:4-7": {
    ref: "1 Corinthians 13:4–7",
    text: "Love is patient and is kind. Love doesn't envy. Love doesn't brag, is not proud, doesn't behave itself inappropriately, doesn't seek its own way, is not provoked, takes no account of evil; doesn't rejoice in unrighteousness, but rejoices with the truth; bears all things, believes all things, hopes all things, endures all things.",
    version: "WEB"
  },
  "1 corinthians 13:13": {
    ref: "1 Corinthians 13:13",
    text: "But now faith, hope, and love remain—these three. The greatest of these is love.",
    version: "WEB"
  },
  "ephesians 2:8-9": {
    ref: "Ephesians 2:8–9",
    text: "For by grace you have been saved through faith, and that not of yourselves; it is the gift of God, not of works, that no one would boast.",
    version: "WEB"
  },
  "ephesians 2:8-10": {
    ref: "Ephesians 2:8–10",
    text: "For by grace you have been saved through faith, and that not of yourselves; it is the gift of God, not of works, that no one would boast. For we are his workmanship, created in Christ Jesus for good works, which God prepared before that we would walk in them.",
    version: "WEB"
  },
  "jeremiah 29:11": {
    ref: "Jeremiah 29:11",
    text: "For I know the thoughts that I think toward you, says Yahweh, thoughts of peace, and not of evil, to give you hope and a future.",
    version: "WEB"
  },
  "proverbs 3:5-6": {
    ref: "Proverbs 3:5–6",
    text: "Trust in Yahweh with all your heart, and don't lean on your own understanding. In all your ways acknowledge him, and he will make your paths straight.",
    version: "WEB"
  },
  "isaiah 40:31": {
    ref: "Isaiah 40:31",
    text: "But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint.",
    version: "WEB"
  },
  "james 1:2-4": {
    ref: "James 1:2–4",
    text: "Count it all joy, my brothers, when you fall into various temptations, knowing that the testing of your faith produces endurance. Let endurance have its perfect work, that you may be perfect and complete, lacking in nothing.",
    version: "WEB"
  },
  "hebrews 11:1": {
    ref: "Hebrews 11:1",
    text: "Now faith is assurance of things hoped for, proof of things not seen.",
    version: "WEB"
  },
  "hebrews 12:1-2": {
    ref: "Hebrews 12:1–2",
    text: "Therefore let's also, seeing we are surrounded by so great a cloud of witnesses, lay aside every weight and the sin which so easily entangles us, and let's run with perseverance the race that is set before us, looking to Jesus, the author and perfecter of faith.",
    version: "WEB"
  },
  "galatians 5:22-23": {
    ref: "Galatians 5:22–23",
    text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faith, gentleness, and self-control. Against such things there is no law.",
    version: "WEB"
  },
  "2 timothy 1:7": {
    ref: "2 Timothy 1:7",
    text: "For God didn't give us a spirit of fear, but of power, love, and self-control.",
    version: "WEB"
  }
};

// Books the regex recognizes. Order matters for longest-match.
const BIBLE_BOOKS = [
  "1 Corinthians","2 Corinthians","1 Thessalonians","2 Thessalonians",
  "1 Timothy","2 Timothy","1 Peter","2 Peter","1 John","2 John","3 John",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles",
  "Song of Solomon",
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges",
  "Ruth","Ezra","Nehemiah","Esther","Job","Psalms","Psalm","Proverbs",
  "Ecclesiastes","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel",
  "Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk",
  "Zephaniah","Haggai","Zechariah","Malachi",
  "Matthew","Mark","Luke","John","Acts","Romans","Galatians","Ephesians",
  "Philippians","Colossians","Titus","Philemon","Hebrews","James","Jude",
  "Revelation"
];

// Build a regex that finds things like "John 3:16" or "1 Corinthians 13:4-7"
const BIBLE_REF_REGEX = new RegExp(
  "\\b(" + BIBLE_BOOKS.map(b => b.replace(/ /g, "\\s+")).join("|") + ")\\s+(\\d+):(\\d+)(?:[–\\-](\\d+))?\\b",
  "gi"
);

function lookupPassage(book, chapter, vStart, vEnd) {
  const b = book.toLowerCase().replace(/\s+/g, " ").trim();
  const normalizedBook = b === "psalms" ? "psalm" : b;
  const range = vEnd ? `${normalizedBook} ${chapter}:${vStart}-${vEnd}` : `${normalizedBook} ${chapter}:${vStart}`;
  const single = `${normalizedBook} ${chapter}:${vStart}`;
  return BIBLE_PASSAGES[range] || BIBLE_PASSAGES[single] || null;
}

Object.assign(window, { BIBLE_PASSAGES, BIBLE_BOOKS, BIBLE_REF_REGEX, lookupPassage });
