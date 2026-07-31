let ExpoSpeechRecognitionModule;
let useSpeechRecognitionEvent;
let speechRecognitionAvailable = true;

try {
  const speechRecognition = require("expo-speech-recognition");
  ExpoSpeechRecognitionModule = speechRecognition.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = speechRecognition.useSpeechRecognitionEvent;

  if (!ExpoSpeechRecognitionModule || !useSpeechRecognitionEvent) {
    throw new Error("expo-speech-recognition exports missing");
  }
} catch (error) {
  speechRecognitionAvailable = false;

  ExpoSpeechRecognitionModule = {
    requestPermissionsAsync: async () => ({ granted: false }),
    start: () => {},
    stop: async () => {},
    abort: () => {},
  };

  useSpeechRecognitionEvent = () => {};
}

export { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent, speechRecognitionAvailable };
