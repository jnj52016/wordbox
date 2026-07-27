export function speakWord(spelling: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(spelling)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
  return true
}
