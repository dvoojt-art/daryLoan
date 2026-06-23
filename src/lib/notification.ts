export const playNotification = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.volume = 0.8;
  audio.play().catch(err => {
    console.log('Audio playback blocked:', err);
  });
};