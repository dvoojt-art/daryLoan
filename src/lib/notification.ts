export const notification = () => {
  const audio = new Audio('/sounds/notification.wav');
  audio.volume = 0.8;
  audio.play().catch(err => {
    console.log('Audio playback blocked:', err);
  });
};