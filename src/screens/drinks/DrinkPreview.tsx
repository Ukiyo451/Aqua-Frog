import { Platform, View } from 'react-native';
import { AddSipOverlay } from '../../components/AddSipOverlay';
import { useStore } from '../../lib/store';
import { ScreenProps, useNav } from '../../navigation/nav';
import { colors } from '../../theme';

/** Shows the pour overlay for any drink without logging it (web previews: `?step=drinkPreview`). */
export function DrinkPreviewScreen({ params }: ScreenProps<{ id?: string }>) {
  const nav = useNav();
  const { state, drink } = useStore();
  const fromUrl = Platform.OS === 'web' && typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null;
  const d = drink(params?.id ?? fromUrl ?? 'coffee');
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AddSipOverlay visible units={state.units} cupMl={d.size} color={d.color} glass={d.glass} shape={d.shape} label={d.label} onClose={nav.back} onAdd={nav.back} />
    </View>
  );
}
