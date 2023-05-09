import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@store/store';
import { setBackground } from '@store/reducers/backgroundReducer';
import { SongContextProvider } from '@context';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
  return (
    <Provider store={store}>
      <SongContextProvider>
        <NativeBaseProvider>
          <SafeAreaView style={{ flex: 1 }}>
            {/* {!loaded && <SplashScreen />} */}
            <RootLayoutNav />
          </SafeAreaView>
        </NativeBaseProvider>
      </SongContextProvider>
    </Provider>
  );
}

function RootLayoutNav() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setBackground());
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
