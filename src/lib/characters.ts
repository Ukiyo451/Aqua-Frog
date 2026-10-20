/**
 * Lily's frog friends. The person collects one daily frog for each day they finish their
 * goal, a challenge frog for each finished challenge, and supporter frogs as a thank-you.
 * Every frog is drawn in code: Lily's body in a different palette plus one accessory.
 */
export type CharacterSection = 'daily' | 'challenge' | 'supporter';

export type Accessory =
  | 'flower'
  | 'cap'
  | 'bucketHat'
  | 'glasses'
  | 'sunglasses'
  | 'scarf'
  | 'crown'
  | 'bow'
  | 'headphones'
  | 'beanie'
  | 'partyHat'
  | 'bandana'
  | 'monocle'
  | 'tiara'
  | 'chefHat'
  | 'earmuffs'
  | 'snorkel'
  | 'leaf'
  | 'cowboy'
  | 'none';

export interface FrogPalette {
  body: string;
  dark: string;
  deep: string;
  belly: string;
}

export interface Character {
  id: string;
  name: string;
  section: CharacterSection;
  palette: FrogPalette;
  accessory: Accessory;
  /** Accessory tint. */
  accent: string;
  /** One-line bio shown when the frog is unlocked. */
  bio: string;
  /** For challenge frogs: the challenge that unlocks it. */
  challengeId?: string;
}

const GREEN: FrogPalette = { body: '#7ED957', dark: '#5CBF45', deep: '#3F9A35', belly: '#E6F9C6' };
const p = (body: string, dark: string, deep: string, belly: string): FrogPalette => ({ body, dark, deep, belly });

const c = (
  id: string,
  name: string,
  section: CharacterSection,
  palette: FrogPalette,
  accessory: Accessory,
  accent: string,
  bio: string,
  challengeId?: string,
): Character => ({ id, name, section, palette, accessory, accent, bio, challengeId });

export const CHARACTERS: Character[] = [
  c('lily', 'Lily', 'daily', GREEN, 'flower', '#FF8DBE', 'The original pond hydrator. Never without her water lily.'),
  c('hank', 'Hoppy Hank', 'daily', p('#6CC7A0', '#4FAE86', '#2F8A66', '#DDF6EA'), 'cap', '#2F6FE0', 'Plays pond baseball and always hits his water goal.'),
  c('pip', 'Pip', 'daily', p('#9BDB5E', '#7CC245', '#57A02E', '#EEFAD9'), 'bow', '#FF5FA2', 'Small frog, big gulps.'),
  c('bubbles', 'Bubbles', 'daily', p('#5FCFE0', '#3FB4C7', '#2390A3', '#DAF6FA'), 'snorkel', '#FFB020', 'Thinks the whole world is a swimming pool.'),
  c('olive', 'Olive', 'daily', p('#A8C256', '#8CA83E', '#6B8726', '#F1F6D8'), 'glasses', '#3A3F4B', 'Reads hydration studies for fun.'),
  c('ziggy', 'Ziggy', 'daily', p('#B98CE8', '#9C6CD6', '#7A4CB8', '#F1E7FB'), 'bucketHat', '#2E2E2E', 'A purple poison-dart frog with a zebra bucket hat.'),
  c('sunny', 'Sunny', 'daily', p('#F6C344', '#E3AB2A', '#BE8714', '#FEF3CF'), 'sunglasses', '#2B2F3A', 'Soaks up the sun, then soaks up the water.'),
  c('basil', 'Basil', 'daily', p('#6FBF4A', '#55A535', '#3C8423', '#E2F4D6'), 'chefHat', '#FFFFFF', 'Cooks soup, counts it toward the goal.'),
  c('coral', 'Coral', 'daily', p('#FF8F80', '#EB7262', '#C9523F', '#FFE6E1'), 'tiara', '#FFD45C', 'Reef royalty from the warm side of the pond.'),
  c('frosty', 'Frosty', 'daily', p('#9ED8F0', '#7CC2E0', '#539FC0', '#EAF7FD'), 'earmuffs', '#FF6B8B', 'Drinks ice-cold water in every season.'),
  c('rocco', 'Rocco', 'daily', p('#8DBF5A', '#719F41', '#557E28', '#EAF4D9'), 'headphones', '#3E64E6', 'Drinks one glass per song on his playlist.'),
  c('mabel', 'Mabel', 'daily', p('#C7E07A', '#ABC85C', '#86A53A', '#F5FADF'), 'scarf', '#E5527A', 'Knits scarves while sipping herbal tea.'),
  c('duke', 'Duke', 'daily', p('#4FAE86', '#3B946F', '#26744F', '#D7F1E6'), 'crown', '#FFD45C', 'King of the lily pads.'),
  c('fern', 'Fern', 'daily', p('#7FD08A', '#62B86F', '#43974F', '#E3F7E6'), 'leaf', '#3F9A35', 'Uses a leaf as an umbrella and a cup.'),
  c('jazz', 'Jazz', 'daily', p('#5E9BEA', '#457FD1', '#2F62AF', '#DFEBFB'), 'beanie', '#FFAA2B', 'A blue frog who scats between sips.'),
  c('tilly', 'Tilly', 'daily', p('#F4A3C7', '#E486B0', '#C4628D', '#FDE8F1'), 'partyHat', '#8E3BE8', 'Celebrates every single glass.'),
  c('gus', 'Gus', 'daily', p('#A2B36B', '#879852', '#6A7B38', '#EEF2DC'), 'cowboy', '#B9773E', 'Rides into town looking for the nearest well.'),
  c('nori', 'Nori', 'daily', p('#3FA77A', '#2F8D64', '#1F6E4B', '#D3EFE1'), 'bandana', '#E5527A', 'Ninja frog. Silent, swift, well hydrated.'),
  c('percy', 'Percy', 'daily', p('#94C973', '#79B058', '#5A8E3C', '#E9F5E0'), 'monocle', '#C9A227', 'A distinguished gentleman of the marsh.'),
  c('kiki', 'Kiki', 'daily', p('#FFB05C', '#EF9540', '#CC7524', '#FFEED9'), 'flower', '#FFFFFF', 'An orange tree frog with a daisy behind her eye.'),
  c('moss', 'Moss', 'daily', p('#6E9F4A', '#588634', '#406622', '#E1EED6'), 'none', '#FFFFFF', 'Quiet, mossy and always sipping.'),
  c('lulu', 'Lulu', 'daily', p('#9CE0D0', '#7DCBB9', '#57AA96', '#E5F8F4'), 'bow', '#14C6D6', 'Ties a bow on her water bottle.'),
  c('rex', 'Rexy', 'daily', p('#B5D94C', '#99BF33', '#78A01C', '#F2F9D6'), 'cap', '#E5527A', 'Wears her cap backwards on hot days.'),
  c('indigo', 'Indigo', 'daily', p('#7C83E8', '#6168D3', '#464CB2', '#E6E7FB'), 'headphones', '#FF5FA2', 'Lo-fi beats to hydrate to.'),

  c('capu', 'Decaf Dot', 'challenge', p('#B9875F', '#9E6D47', '#7C4F2E', '#F4E7DC'), 'headphones', '#F2F2F2', 'Swapped coffee for water and never looked back.', 'caffeine'),
  c('tearex', 'Tea Toad', 'challenge', p('#8CC63F', '#72AB2A', '#548A17', '#ECF7D8'), 'cap', '#F5D33F', 'Knows a tea for every mood.', 'tea'),
  c('cheeto', 'Sugar-free Sam', 'challenge', p('#F2A53A', '#DB8B22', '#B66C10', '#FDEBD0'), 'sunglasses', '#E5527A', 'No soda, no cheating, all smiles.', 'nocheat'),
  c('sloth', 'Slim Jim', 'challenge', p('#3FA77A', '#2F8D64', '#1F6E4B', '#D3EFE1'), 'bandana', '#8E3BE8', 'Drinks a glass before every meal.', 'weightloss'),
  c('platy', 'Oat Otto', 'challenge', p('#E9A3C7', '#D485AE', '#B2648B', '#FBE8F1'), 'glasses', '#2B2F3A', 'Lactose-free and loving it.', 'lactose'),
  c('puffin', 'Vita Vee', 'challenge', p('#FFAA2B', '#EB8F12', '#C77100', '#FFEBCB'), 'flower', '#FF5FA2', 'Gets her vitamins from fresh juice and smoothies.', 'vitamin'),
  c('bear', 'Sober Sid', 'challenge', p('#7DA8D8', '#618DC1', '#4570A2', '#E3EDF8'), 'beanie', '#E5527A', 'Ten days, zero hangovers.', 'sober'),
  c('meerkat', 'Hop Hop', 'challenge', p('#C9D45A', '#AEB940', '#8B9626', '#F4F7DB'), 'partyHat', '#3E64E6', 'Does ten hops after every glass.', 'sport'),
  c('deer', 'Brewless Bea', 'challenge', p('#E8C26A', '#D4A84D', '#B0852D', '#FBF1DA'), 'crown', '#9C2530', 'Gave up beer for sparkling water.', 'nobeer'),
  c('fresh', 'New Leaf', 'challenge', p('#5FCFA0', '#43B585', '#2A9368', '#DBF6EA'), 'leaf', '#3F9A35', 'Started the new year with nothing but water.', 'newyear'),

  c('okapi', 'Golden Goldie', 'supporter', p('#F6C344', '#E3AB2A', '#BE8714', '#FEF3CF'), 'crown', '#FF5FA2', 'A rare golden frog, thank you for supporting Lily!'),
  c('surf', 'Surfer Sol', 'supporter', p('#5FCFE0', '#3FB4C7', '#2390A3', '#DAF6FA'), 'sunglasses', '#FFAA2B', 'Catches waves and keeps everyone hydrated.'),
  c('rainbow', 'Rainbow Rae', 'supporter', p('#B98CE8', '#9C6CD6', '#7A4CB8', '#F1E7FB'), 'tiara', '#14C6D6', 'Shines in every colour of the pond.'),
];

export const CHARACTER_BY_ID: Record<string, Character> = Object.fromEntries(CHARACTERS.map((x) => [x.id, x]));

export const DAILY = CHARACTERS.filter((x) => x.section === 'daily');
