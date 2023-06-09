import { useMemo } from 'react';
import { Avatar, HStack, Text, VStack } from 'native-base';
import { COLORS } from '@global';
import { withMusicContext } from '@hoc';
import { chooseAvatarImage } from '@utils';

type MusicPlayerHeaderProps = {
  songDetails: {
    title: string;
    album: string;
  };
};

const MusicPlayerHeaderComponent = ({ songDetails }: MusicPlayerHeaderProps) => {
  const avatarImage = useMemo(() => chooseAvatarImage(), [songDetails]);
  return (
    <HStack alignItems="center">
      <Avatar
        size="xl"
        bgColor={COLORS.background_content_primary}
        key={avatarImage.toString()}
        source={avatarImage}
      />
      <VStack ml={5} flexShrink={1}>
        <Text fontSize="xl">{songDetails.title}</Text>
        <Text>{songDetails.album}</Text>
      </VStack>
    </HStack>
  );
};

export const MusicPlayerHeader = withMusicContext(MusicPlayerHeaderComponent, {
  songDetails: data => data.songDetails,
});
