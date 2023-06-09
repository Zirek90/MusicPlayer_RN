import { Audio } from 'expo-av';
import { calculateProgress, calculateSongPosition } from '@utils';
import { StorageService } from '../StorageService';

export const MusicService = {
  play: async (
    uri: string,
    setProgress: (v: number) => void,
    setIsSongDone: (v: boolean) => void,
    songProgress: number,
    currentSongDuration: number,
    isReactivated?: boolean,
  ) => {
    setIsSongDone(false);
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false },
      async status => {
        if (status.isLoaded) {
          if (!status.positionMillis && isReactivated) return; // to skip flickering effect of song progress after reactivating the song

          const totalDuration = status.durationMillis! / 1000;
          const currentPosition = status.positionMillis / 1000;
          const timeLeft = calculateProgress(totalDuration, currentPosition);
          setProgress(timeLeft);
          StorageService.set('songProgress', timeLeft);

          if (status.didJustFinish) {
            if (status.isLooping) return;
            setIsSongDone(true);
          }
        }
      },
    );
    if (isReactivated) {
      const currentPositon = calculateSongPosition(songProgress, currentSongDuration);
      await sound.setPositionAsync(currentPositon);
    }
    await sound.playAsync();
    return sound;
  },
  stop: async (soundObject: Audio.Sound) => {
    await soundObject.stopAsync();
    await soundObject.unloadAsync();
  },
  pause: async (soundObject: Audio.Sound) => {
    await soundObject.pauseAsync();
  },
  resume: async (soundObject: Audio.Sound) => {
    await soundObject.playAsync();
  },
  loop: async (soundObject: Audio.Sound) => {
    const currentSong = await soundObject.getStatusAsync();
    if (currentSong.isLoaded) {
      const isLooping = currentSong.isLooping;
      await soundObject.setIsLoopingAsync(!isLooping);
    }
  },
};
