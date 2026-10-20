import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Drink, DrinkKind, DRINKS } from '../lib/drinks';
import { fonts } from '../theme';
import { MiniCup } from './Cup';
import { DrinkIcon } from './CupIcon';
import { PulseRing } from './effects';
import { Bounce } from './Pressable';

interface Props {
  /** One of the four classic drinks (drawn as the glass). */
  kind?: DrinkKind;
  /** Any drink from the list, drawn with its own cup icon. Wins over `kind`. */
  drink?: Drink;
  onPress: () => void;
  pulse?: boolean;
  size?: number;
}

export function DrinkButton({ kind = 'water', drink, onPress, pulse, size = 44 }: Props) {
  const d = drink ?? DRINKS[kind];
  return (
    <Bounce onPress={onPress} style={styles.wrap} testID={`drink-${drink ? drink.id : kind}`}>
      <View style={[styles.icon, { width: size * 1.6, height: size * 1.6 }]}>
        {pulse && <PulseRing size={size * 1.8} />}
        {drink ? <DrinkIcon drink={drink} size={size * 1.3} /> : <MiniCup size={size} color={d.color} glass={d.glass} />}
        <View style={[styles.plus, { backgroundColor: d.color }]}>
          <Svg width={10} height={10} viewBox="0 0 10 10">
            <Path d="M5 1 V9 M1 5 H9" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </View>
      </View>
      {drink ? (
        <Text style={[styles.label, styles.wrapLabel, { width: size * 1.9 }]} numberOfLines={2}>
          {drink.label.toUpperCase()}
        </Text>
      ) : (
        <Text style={styles.label}>{d.label}</Text>
      )}
    </Bounce>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  icon: { alignItems: 'center', justifyContent: 'center' },
  plus: {
    position: 'absolute',
    bottom: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  label: { fontFamily: fonts.black, fontSize: 10, color: '#B6BCC6', letterSpacing: 0.6, marginTop: -2 },
  wrapLabel: { textAlign: 'center', lineHeight: 12 },
});
