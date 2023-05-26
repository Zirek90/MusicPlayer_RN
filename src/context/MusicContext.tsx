import {
  PropsWithChildren,
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { Audio } from 'expo-av';
import { useDispatch } from 'react-redux';
import { SongStatus } from '@enums';
import { pauseSong, playSong, stopSong, resumeSong, loopSong } from '@store/reducers';
import { calculateSongPosition } from '@utils';
import { MusicService, StorageService } from '@service';
import { useAlbumsContext } from './AlbumsContext';

export interface ContextState {
  songProgress: number;
  songDetails: {
    title: string;
    album: string;
  };
  handleSongProgress: (progress: number) => Promise<void>;
  handleSongIndex: (index: number) => void;
  handleMusicPlayerPlay: () => Promise<void>;
  handlePlay: (
    songStatus: SongStatus,
    id: string,
    filename: string,
    uri: string,
    duration: number,
  ) => Promise<void>;
  handleResume: () => Promise<void>;
  handleStop: () => Promise<void>;
  handlePause: () => Promise<void>;
  handleLoop: () => Promise<void>;
  handlePrevious: () => Promise<void>;
  handleNext: () => Promise<void>;
}

const MusicContext = createContext<ContextState>({} as ContextState);

export const MusicContextProvider = ({ children }: PropsWithChildren) => {
  const [song, setSong] = useState<Audio.Sound>();
  const [songDetails, setSongDetails] = useState({
    title: '',
    album: '',
  });
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [currentSongDuration, setCurrentSongDuration] = useState(0);
  const [songProgress, setSongProgress] = useState(0);
  const [isSongDone, setIsSongDone] = useState(false);
  const { activeAlbum } = useAlbumsContext();
  const dispatch = useDispatch();

  const handlePlay = useCallback(
    async (songStatus: SongStatus, id: string, filename: string, uri: string, duration: number) => {
      if (song) {
        MusicService.stop(song);
      }

      const sound = await MusicService.play(uri, setSongProgress, setIsSongDone);
      dispatch(playSong({ id, filename, uri, songStatus, duration }));
      setCurrentSongDuration(duration);
      setSong(sound);
    },
    [song],
  );

  const handleResume = useCallback(async () => {
    if (!song) return;

    await MusicService.resume(song);
    dispatch(resumeSong());
  }, [song]);

  const handleStop = useCallback(async () => {
    if (!song) return;

    await MusicService.stop(song);
    dispatch(stopSong({ songStatus: SongStatus.STOP }));
    setSongProgress(0);
    setSong(undefined);
  }, [song]);

  const handlePause = useCallback(async () => {
    if (!song) return;

    await MusicService.pause(song);
    dispatch(pauseSong({ songStatus: SongStatus.PAUSE }));
  }, [song]);

  const handleLoop = useCallback(async () => {
    if (!song) return;

    await MusicService.loop(song);
    dispatch(loopSong());
  }, [song]);

  const handlePrevious = useCallback(async () => {
    if (!activeAlbum) return;

    const previousIndex = currentSongIndex === 0 ? 0 : currentSongIndex - 1;
    const previousSong = activeAlbum.items[previousIndex]!;
    setCurrentSongIndex(previousIndex);

    const { id, filename, uri, duration } = previousSong;
    await handlePlay(SongStatus.PLAY, id, filename, uri, duration);
  }, [activeAlbum, currentSongIndex, handlePlay]);

  const handleNext = useCallback(async () => {
    if (!activeAlbum) return;

    const albumLength = activeAlbum.items.length - 1;
    const nextIndex = currentSongIndex === albumLength ? 0 : currentSongIndex + 1;
    setCurrentSongIndex(nextIndex);
    const nextSong = activeAlbum.items[nextIndex];

    const { id, filename, uri, duration } = nextSong;
    await handlePlay(SongStatus.PLAY, id, filename, uri, duration);
  }, [activeAlbum, currentSongIndex, handlePlay]);

  const handleMusicPlayerPlay = useCallback(async () => {
    if (!activeAlbum) return;

    const currentSong = activeAlbum.items[currentSongIndex];
    handlePlay(
      SongStatus.PLAY,
      currentSong.id,
      currentSong.filename,
      currentSong.uri,
      currentSong.duration,
    );
  }, [activeAlbum]);

  const handleSongProgress = useCallback(
    async (progress: number) => {
      if (song) {
        const currentPositon = calculateSongPosition(progress, currentSongDuration);
        await song.setPositionAsync(currentPositon);
      }
    },
    [song, currentSongDuration],
  );

  const handleSongIndex = useCallback((index: number) => setCurrentSongIndex(index), []);

  const manageStorage = useCallback(async () => {
    await StorageService.set('album', activeAlbum!);
    await StorageService.set('songIndex', currentSongIndex!);
  }, [activeAlbum, currentSongIndex]);

  useEffect(() => {
    if (!activeAlbum) return;
    const currentSong = activeAlbum.items[currentSongIndex];
    setSongDetails({
      title: currentSong.filename,
      album: activeAlbum.album,
    });
    manageStorage();
  }, [activeAlbum, currentSongIndex]);

  useEffect(() => {
    const fetchStoredIndex = async () => {
      const { songIndex } = await StorageService.get();
      if (!songIndex) return;
      setCurrentSongIndex(songIndex);
    };
    fetchStoredIndex();
  }, []);

  useEffect(() => {
    if (!isSongDone) return;
    handleNext();
  }, [isSongDone]);

  return (
    <MusicContext.Provider
      value={{
        songProgress,
        songDetails,
        handlePlay,
        handlePause,
        handleResume,
        handleStop,
        handleLoop,
        handleNext,
        handlePrevious,
        handleSongProgress,
        handleSongIndex,
        handleMusicPlayerPlay,
      }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusicContext = () => {
  return useContext(MusicContext);
};
