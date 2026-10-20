import { CupIcon } from '../../components/CupIcon';
import { useStore } from '../../lib/store';

/** Small cup in a drink's colours and shape for the day log, the poster and the drink picker. */
export function DrinkGlyph({ id, size }: { id: string; size: number }) {
  const { drink } = useStore();
  const d = drink(id);
  return <CupIcon shape={d.shape} color={d.color} glass={d.glass} size={size} />;
}
