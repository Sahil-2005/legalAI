import { useState, useEffect } from "react";

const Typewriter = ({ text, delay = 10, startDelay = 0, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Reset state when text changes
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
    } else {
      if (onComplete) onComplete();
    }
  }, [hasStarted, index, text, delay, onComplete]);

  return <span>{displayedText}</span>;
};

export default Typewriter;
