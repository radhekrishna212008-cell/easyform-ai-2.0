// Lyrics Writer & Song Assistant
// Sectional lyric generator, meter/syllable analyzer, and multi-genre songwriting helper.

export interface SongSection {
  type: "intro" | "verse" | "chorus" | "bridge" | "outro";
  label: string;
  lines: string[];
}

export interface LyricTemplate {
  id: string;
  title: string;
  genre: string;
  language: "en" | "hi" | "hinglish";
  theme: string;
  sections: SongSection[];
}

export const PRESET_LYRICS: LyricTemplate[] = [
  {
    id: "bollywood-soul",
    title: "Khwabon Ki Rahein (ख्वाबों की राहें)",
    genre: "Bollywood Acoustic Melodic",
    language: "hinglish",
    theme: "Hope, Journey & Ambition",
    sections: [
      {
        type: "verse",
        label: "Verse 1",
        lines: [
          "Dheemi hawa mein ek nayi subah ki aahat hai",
          "Kadam badhaoon to manzil bhi muskurati hai",
          "Raaste mushkil sahi, par hausla buland hai",
          "Har ek mod par naya silsila shuru hota hai",
        ],
      },
      {
        type: "chorus",
        label: "Chorus",
        lines: [
          "Khwabon ki raahon pe chal pade hain hum",
          "Na roke koi toofan, na toote ye kadam",
          "Apni kismat ko hum khud likhenge aaj",
          "Roshan hoga aane wala har ek naya saaz",
        ],
      },
      {
        type: "verse",
        label: "Verse 2",
        lines: [
          "Raaton ke andhere bhi roshni mein dhal gaye",
          "Mehnat ke diye har kone mein jal gaye",
          "Sikha hai gir kar dubara sambhalna",
          "Hawaon ke sang ab aage nikalna",
        ],
      },
      {
        type: "bridge",
        label: "Bridge",
        lines: [
          "Jab dil mein sachha vishwas ho",
          "Har pal mein jeet ka ehsaas ho",
        ],
      },
      {
        type: "outro",
        label: "Outro",
        lines: [
          "Khwabon ki raahon pe... hum chal pade...",
          "Nayi subah ke sang... hum ud chale...",
        ],
      },
    ],
  },
  {
    id: "lofi-midnight",
    title: "Midnight Reflections",
    genre: "Lo-Fi Chill Beats",
    language: "en",
    theme: "Peace, City Lights & Solitude",
    sections: [
      {
        type: "verse",
        label: "Verse 1",
        lines: [
          "Streetlights flickering through the rain",
          "Washing away the noise and the pain",
          "Coffee cup cooling on the window sill",
          "In the quiet of the night, everything is still",
        ],
      },
      {
        type: "chorus",
        label: "Chorus",
        lines: [
          "Drifting with the midnight groove",
          "Nothing to prove, just letting it soothe",
          "Lo-fi rhythm playing on repeat",
          "Finding my peace on this empty street",
        ],
      },
      {
        type: "verse",
        label: "Verse 2",
        lines: [
          "Thoughts unfolding like a melody",
          "Letting go of what used to be",
          "Simple chords holding up the night",
          "Everything feels calm, everything feels right",
        ],
      },
      {
        type: "outro",
        label: "Outro",
        lines: [
          "Just the music in the air...",
          "Drifting away without a care...",
        ],
      },
    ],
  },
  {
    id: "pop-unstoppable",
    title: "Rise & Shine",
    genre: "Upbeat Pop Anthem",
    language: "en",
    theme: "Confidence, Energy & Success",
    sections: [
      {
        type: "verse",
        label: "Verse 1",
        lines: [
          "Hear the heartbeat picking up the pace",
          "Ready for the world, running in the race",
          "No more doubts holding back my feet",
          "Moving in time to this electric beat",
        ],
      },
      {
        type: "chorus",
        label: "Chorus",
        lines: [
          "We rise, we shine, we own the light",
          "Breaking through the limits tonight",
          "Turn the volume up and let it ring",
          "This is our song, hear the whole world sing!",
        ],
      },
      {
        type: "verse",
        label: "Verse 2",
        lines: [
          "Every high and low brought me to this stage",
          "Turn the new page, welcome to the age",
          "Golden sparks in the midnight sky",
          "Spread your wings and watch us fly",
        ],
      },
      {
        type: "outro",
        label: "Outro",
        lines: [
          "Oh we rise, we shine... together now!",
          "Nothing's gonna stop our sound!",
        ],
      },
    ],
  },
  {
    id: "hindi-motivation",
    title: "Umeedon Ki Udaan (उम्मीदों की उड़ान)",
    genre: "Indian Classical Fusion",
    language: "hi",
    theme: "Perseverance & Dedication",
    sections: [
      {
        type: "verse",
        label: "Verse 1",
        lines: [
          "सूरज की पहली किरण संग जागा है विश्वास",
          "सपनों को सच करने का मन में है अभ्यास",
          "कठिन डगर भी सरल बनेगी अपनी मेहनत से",
          "रंग लाएगी हर एक कोशिश दिल की शिद्दत से",
        ],
      },
      {
        type: "chorus",
        label: "Chorus",
        lines: [
          "उड़ान भरेंगे हम अम्बर के पार",
          "होगा नई मंज़िलों का दीदार",
          "हिम्मत ही अपनी सच्ची पहचान है",
          "हर मुश्किल से लड़ना अपना अरमान है",
        ],
      },
      {
        type: "verse",
        label: "Verse 2",
        lines: [
          "जो सीखा है वक्त से वो याद रखेंगे",
          "नेक इरादों से हर बाधा को जीत लेंगे",
          "सुर और ताल में बहती है ये दास्तां",
          "खुले गगन में महकता अपना जहां",
        ],
      },
      {
        type: "outro",
        label: "Outro",
        lines: [
          "उड़ान भरेंगे हम... अम्बर के पार...",
          "जीतेंगे हर बाज़ी... यही है पुकार...",
        ],
      },
    ],
  },
];

/**
 * Estimates English/Hinglish syllable count in a line to help align lyric phrasing with musical meter.
 */
export function estimateSyllables(text: string): number {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const words = clean.split(/\s+/).filter(Boolean);
  if (!words.length) return 0;

  let count = 0;
  for (const word of words) {
    if (word.length <= 3) {
      count += 1;
      continue;
    }
    const matches = word.match(/[aeiouy]{1,2}/g);
    let s = matches ? matches.length : 1;
    if (word.endsWith("e") && !word.endsWith("le")) s = Math.max(1, s - 1);
    count += s;
  }
  return count;
}

/**
 * Converts structured sections into a formatted lyric sheet text.
 */
export function formatLyricsText(sections: SongSection[]): string {
  return sections
    .map((s) => `[${s.label}]\n${s.lines.join("\n")}`)
    .join("\n\n");
}

/**
 * Parses freeform lyric text into structured sections.
 */
export function parseLyricsText(raw: string): SongSection[] {
  const blocks = raw.split(/(?=\[[^\]]+\])/g).filter(Boolean);
  if (!blocks.length) {
    return [
      {
        type: "verse",
        label: "Verse",
        lines: raw.split("\n").filter((l) => l.trim()),
      },
    ];
  }

  return blocks.map((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    let label = "Verse";
    let type: SongSection["type"] = "verse";

    if (lines[0]?.startsWith("[") && lines[0]?.endsWith("]")) {
      label = lines[0].slice(1, -1);
      lines.shift();
      const lower = label.toLowerCase();
      if (lower.includes("chorus")) type = "chorus";
      else if (lower.includes("intro")) type = "intro";
      else if (lower.includes("bridge")) type = "bridge";
      else if (lower.includes("outro")) type = "outro";
    }

    return { type, label, lines };
  });
}
