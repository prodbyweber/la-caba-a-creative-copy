export const TEMPLATES = {
  mono_cinema: {
    id: "mono_cinema",
    name: "MONO CINEMA",
    number: "01",
    desc: "Sans-serif uppercase, fade + slide",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    animationType: "fade_slide",
    layout: "single",
  },
  editorial_noir: {
    id: "editorial_noir",
    name: "EDITORIAL NOIR",
    number: "02",
    desc: "Serif + sans, side reveal",
    fontFamily: "'Georgia', serif",
    fontWeight: "400",
    textTransform: "none",
    letterSpacing: "0.06em",
    animationType: "side_reveal",
    layout: "double",
  },
  impact_subtitles: {
    id: "impact_subtitles",
    name: "IMPACT SUBTITLES PRO",
    number: "03",
    desc: "Bold, word-by-word, highlight",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    animationType: "word_pop",
    layout: "subtitle",
  },
  triple_layer: {
    id: "triple_layer",
    name: "TRIPLE LAYER CINEMA",
    number: "04",
    desc: "3-tier hierarchy, staggered",
    fontFamily: "'Georgia', serif",
    fontWeight: "700",
    textTransform: "none",
    letterSpacing: "0.05em",
    animationType: "stagger",
    layout: "triple",
  },
  fashion_glitch: {
    id: "fashion_glitch",
    name: "FASHION GLITCH LUXE",
    number: "05",
    desc: "Centered, micro-glitch, reflection",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "300",
    textTransform: "uppercase",
    letterSpacing: "0.22em",
    animationType: "glitch",
    layout: "single",
  },
};

export const STOCK_VIDEOS = [
  {
    label: "Urban Rooftop Night",
    url: "https://assets.mixkit.co/videos/preview/mixkit-city-at-night-seen-from-a-rooftop-9394-large.mp4",
    poster: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=711&fit=crop"
  },
  {
    label: "Dark Studio Performance",
    url: "https://assets.mixkit.co/videos/preview/mixkit-musician-in-a-recording-studio-5453-large.mp4",
    poster: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=711&fit=crop"
  },
  {
    label: "Slow Motion Fashion",
    url: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-walking-in-a-forest-3591-large.mp4",
    poster: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=711&fit=crop"
  }
];