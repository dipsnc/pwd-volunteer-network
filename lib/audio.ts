export const playAudioMessage = (message: string) => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      const saved = localStorage.getItem('accessibility-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        if (!settings.audioCues) return; // Don't play if audio cues are disabled
      } else {
        return; // Default to false if no settings found
      }
    } catch (e) {
      // Ignore parsing errors, assume false
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};
