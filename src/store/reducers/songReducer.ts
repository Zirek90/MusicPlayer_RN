import { createSlice } from '@reduxjs/toolkit';
import { SongStatus } from '@enums';

type initialStateProps = {
  id: string | null;
  songStatus: SongStatus;
  isLooping: boolean;
};

const initialState: initialStateProps = {
  id: null,
  songStatus: SongStatus.STOP,
  isLooping: false,
};

export const songSlice = createSlice({
  name: 'song',
  initialState,
  reducers: {
    playSong: (state, action) => {
      state = action.payload;
      return state;
    },
    stopSong: (state, action) => {
      state.songStatus = action.payload.songStatus;
      state.id = null;
      return state;
    },
    pauseSong: (state, action) => {
      state.songStatus = action.payload.songStatus;
      return state;
    },
    resumeSong: state => {
      state.songStatus = SongStatus.PLAY;
      return state;
    },
    loopSong: state => {
      state.isLooping = !state.isLooping;
      return state;
    },
  },
});

export const { playSong, stopSong, pauseSong, resumeSong, loopSong } = songSlice.actions;
