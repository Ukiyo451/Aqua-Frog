import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bounce } from '../../components/Pressable';
import { fonts } from '../../theme';

export function SkipButton({ onPress, color = '#B9BFC9' }: { onPress: () => void; color?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <Bounce onPress={onPress} style={[styles.skip, { top: insets.top + 6 }]} testID="skip">
      <Text style={[styles.text, { color }]}>SKIP</Text>
    </Bounce>
  );
}

const styles = StyleSheet.create({
  skip: { position: 'absolute', right: 14, padding: 10, zIndex: 10 },
  text: { fontFamily: fonts.black, fontSize: 12, letterSpacing: 0.8 },
});
