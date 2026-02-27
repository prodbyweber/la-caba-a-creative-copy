import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SUBTITLE_TEMPLATES, DEMO_SUBTITLE_LINES } from "./templates";

const WORD_INTERVAL = 420; // ms per word

function SubtitleLine({ template: tpl, text, playing }) {
  const words = text.split(" ");
  const [activeWord, setActiveWord] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    if (!playing) { setActiveWord(0); return; }
    setActiveWord(0);
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      if (i >= words.length) { clearInterval(intervalRef.current); return; }
      setActiveWord(i);
    }, WORD_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [playing, text]);

  const baseStyle = {
    fontFamily: tpl.fontFamily,
    fontWeight: tpl.fontWeight,
    fontSize: tpl.fontSize,
    textTransform: tpl.textTransform,
    textShadow: tpl.shadow !== "none" ? tpl.shadow : undefined,
    lineHeight: 1.3,
  };

  // Position mapping
  const posTop = tpl.position === "arriba" ? "12%" : tpl.position === "centro" ? "50%" : "80%";
  const posTransform = tpl.position === "centro" ? "translate(-50%,-50%)" : "translateX(-50%)";

  const containerStyle = {
    position: "absolute",
    top: posTop,
    left: "50%",
    transform: posTransform,
    width: "90%",
    textAlign: "center",
    zIndex: 20,
  };

  // BAR style
  if (tpl.bgStyle === "bar") {
    return (
      <div style={containerStyle}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={playing ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.3 }}
          style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", flexWrap: "wrap" }}
        >
          <div style={{ width: 4, height: tpl.fontSize * 1.4, background: tpl.highlightColor, borderRadius: 2, flexShrink: 0 }} />
          <span style={{ ...baseStyle, color: tpl.color, display: "block" }}>{text}</span>
        </motion.div>
      </div>
    );
  }

  // BOX style (each word gets bg)
  if (tpl.bgStyle === "box") {
    return (
      <div style={containerStyle}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={playing && i <= activeWord ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, delay: i === 0 ? 0 : 0 }}
              style={{
                ...baseStyle,
                background: i === activeWord ? (tpl.highlightBg || "#FFFFFF") : "rgba(255,255,255,0.85)",
                color: tpl.color,
                padding: "2px 8px",
                borderRadius: 4,
                display: "inline-block",
              }}
            >
              {w}
            </motion.span>
          ))}
        </div>
      </div>
    );
  }

  // WORD HIGHLIGHT / WORD POP / FADE_WORD — default
  return (
    <div style={containerStyle}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={playing ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 6px" }}
      >
        {words.map((w, i) => {
          const isActive = i === activeWord;
          const isPast = i < activeWord;

          let wordColor = isPast ? `${tpl.color}88` : tpl.color;
          let wordScale = 1;
          let wordShadow = tpl.shadow !== "none" ? tpl.shadow : undefined;

          if (isActive && tpl.highlightColor) {
            wordColor = tpl.highlightColor;
            wordShadow = tpl.shadow !== "none" ? tpl.shadow : undefined;
          }
          if (tpl.animationType === "word_pop" && isActive) wordScale = 1.12;

          // neon glow for active
          if (tpl.animationType === "word_highlight" && isActive && tpl.highlightColor) {
            wordShadow = `0 0 16px ${tpl.highlightColor}, 0 0 32px ${tpl.highlightColor}66, 0 2px 8px rgba(0,0,0,0.9)`;
          }

          const wordStyle = {
            fontFamily: tpl.fontFamily,
            fontWeight: tpl.fontWeight,
            fontSize: tpl.fontSize,
            textTransform: tpl.textTransform,
            color: wordColor,
            textShadow: wordShadow,
            display: "inline-block",
            transition: "color 0.15s, transform 0.15s",
            transform: `scale(${wordScale})`,
            WebkitTextStroke: tpl.stroke || undefined,
          };

          return (
            <motion.span
              key={i}
              animate={playing && i <= activeWord ? { opacity: 1 } : { opacity: playing ? 0.5 : 0 }}
              transition={{ duration: 0.18 }}
              style={wordStyle}
            >
              {w}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    </div>
  );
}

export default function SubtitlePreview({ subtitleTemplateId, playing, videoSrc, isVertical, customText }) {
  const tpl = SUBTITLE_TEMPLATES[subtitleTemplateId] || SUBTITLE_TEMPLATES.classic_white;
  const lines = customText ? customText.split("\n").filter(Boolean) : DEMO_SUBTITLE_LINES;
  const [lineIdx, setLineIdx] = useState(0);
  const lineRef = useRef();

  useEffect(() => {
    if (!playing) { setLineIdx(0); return; }
    setLineIdx(0);
    const words = lines[0]?.split(" ").length || 4;
    let current = 0;
    const next = () => {
      current++;
      if (current >= lines.length) { current = 0; }
      setLineIdx(current);
      const nextWords = lines[current]?.split(" ").length || 4;
      clearTimeout(lineRef.current);
      lineRef.current = setTimeout(next, nextWords * WORD_INTERVAL + 600);
    };
    lineRef.current = setTimeout(next, words * WORD_INTERVAL + 600);
    return () => clearTimeout(lineRef.current);
  }, [playing, subtitleTemplateId]);

  return (
    <AnimatePresence mode="wait">
      <SubtitleLine key={`${subtitleTemplateId}-${lineIdx}`} template={tpl} text={lines[lineIdx] || ""} playing={playing} />
    </AnimatePresence>
  );
}