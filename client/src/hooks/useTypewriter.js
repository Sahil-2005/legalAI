import { useState, useEffect } from "react";

export const useTypewriter = (text, delay = 10, startDelay = 0) => {
  const [displayedText, setDisplayedText] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setIndex(0);
    setHasStarted(false);

    let timeout;
    if (startDelay > 0) {
      timeout = setTimeout(() => setHasStarted(true), startDelay);
    } else {
      setHasStarted(true);
    }
    return () => clearTimeout(timeout);
  }, [text, startDelay]);

  useEffect(() => {
    if (!hasStarted) return;
    if (!text) return;

    if (index < text.length) {
      const interval = setInterval(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex((prevIndex) => prevIndex + 1);
      }, delay);
      
      return () => clearInterval(interval);
    }
  }, [hasStarted, index, text, delay]);

  return displayedText;
};
