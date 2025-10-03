"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";

const phrases = [
  "Feature Engineering...",
  "Data Analysis...",
  "Machine Learning...",
  "Data Visualization...",
];

const FeatureEngineeringTyping = () => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const delayBetweenPhrases = 2000;

    const type = () => {
      if (!isDeleting && charIndex < currentPhrase.length) {
        setDisplayedText(currentPhrase.slice(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        setDisplayedText(currentPhrase.slice(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      } else if (!isDeleting && charIndex === currentPhrase.length) {
        setTimeout(() => setIsDeleting(true), delayBetweenPhrases);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    };

    const timer = setTimeout(type, typingSpeed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, currentPhraseIndex]);

  return (
    <div className="relative w-full h-screen">
      {/* Background image */}
      <Image
        src="/ai.jpg"
        alt="Data Visualization"
        fill
        className="object-cover brightness-50 dark:brightness-[0.2]"
        priority
      />

      {/* Centered typing effect */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-4xl font-mono text-white whitespace-nowrap">
          {displayedText}
          <span className="border-r-4 border-white animate-pulse ml-1"></span>
        </div>
      </div>
    </div>
  );
};

export default FeatureEngineeringTyping;
