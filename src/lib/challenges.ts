/**
 * Healthy challenges. Each lasts a fixed number of days; the person finishes their goal
 * every day while following the rules, and earns the matching challenge frog.
 */
export interface Challenge {
  id: string;
  title: string;
  /** e.g. "10-DAY CHALLENGE" */
  days: number;
  /** Card colour. */
  color: string;
  /** Darker shade for buttons on the card. */
  deep: string;
  tagline: string;
  intro: string;
  benefits: { emoji: string; text: string }[];
  tips: string[];
  /** Character unlocked by finishing it. */
  characterId: string;
  /** Drinks that break the challenge's rules (ids from the drinks catalog). */
  avoid?: string[];
  /** Only these drinks are allowed; anything else breaks the rules (water-only challenges). */
  only?: string[];
  /** At least one of these must be logged for a day to count. */
  requires?: string[];
  /** Short rule shown on the home card and in the started screen. */
  rule?: string;
  /** Limited-time challenges show in their own banner on the home screen. */
  limited?: boolean;
}

const ALCOHOL = ['beer', 'wine', 'whiteWine', 'cocktail', 'liquor'];

export const CHALLENGES: Challenge[] = [
  {
    id: 'newyear',
    title: 'Fresh Start Frog',
    days: 5,
    color: '#3DB59A',
    deep: '#24917A',
    tagline: 'Hydrate yourself with nothing but water.',
    rule: 'Hydrate yourself with nothing but water.',
    intro:
      'Five days of plain water, nothing else in the cup. It is a gentle reset for your body and your habits: no sugar, no caffeine, no alcohol, just clean hydration. Keep your meals as usual, and let water do the rest.',
    benefits: [
      { emoji: '🌱', text: 'A real reset. Five water-only days make it easy to notice how much the other drinks were doing to your energy and sleep.' },
      { emoji: '✨', text: 'Brighter skin. Steady hydration without sugar helps your skin feel softer and look more even.' },
      { emoji: '🧠', text: 'Clearer head. Your brain is mostly water, and it notices when you keep it topped up.' },
      { emoji: '🫘', text: 'Happy kidneys. More water helps your body flush out what it does not need.' },
      { emoji: '💰', text: 'Saved money. No more coffee-shop stops or fancy bottles on the way home.' },
    ],
    tips: [
      'Keep a full bottle within reach all day. If you can see it, you will sip it.',
      'Sparkling water counts! Bubbles make plain water feel like a treat.',
      'Add a slice of lemon, cucumber or a few mint leaves for flavour without breaking the rules.',
      'Drink a glass first thing in the morning, before anything else, to start the day ahead.',
      'Tell a friend you are doing it. Having someone to report to makes the five days fly by.',
    ],
    characterId: 'fresh',
    only: ['water', 'sparkling'],
    limited: true,
  },
  {
    id: 'caffeine',
    title: 'Escape Caffeine Croaker',
    days: 10,
    color: '#6E4A3A',
    deep: '#4D3226',
    tagline: 'Ten days without coffee, energy drinks or cola.',
    rule: 'No coffee, black tea, energy drinks or soda.',
    intro:
      'Caffeine gives a quick lift and then takes it back with interest: jitters, an afternoon slump, and nights spent staring at the ceiling. For ten days, swap every cup of coffee for water or a caffeine-free drink and see how your body feels on its own steam.',
    benefits: [
      { emoji: '😴', text: 'Deeper sleep. Caffeine stays in your body for hours; without it, falling asleep gets easier and you wake up more rested.' },
      { emoji: '🧘', text: 'Calmer days. Fewer jitters, a steadier heartbeat and less of that wired-but-tired feeling.' },
      { emoji: '⚡', text: 'Real energy. After the first few days your energy evens out instead of rising and crashing.' },
      { emoji: '🦷', text: 'Whiter teeth. Coffee and cola stain teeth; water does not.' },
      { emoji: '💧', text: 'Better hydration. Every coffee you skip is a glass of water you actually keep.' },
    ],
    tips: [
      'Cut down slowly in the days before you start if you drink a lot of coffee. It softens the first-day headache.',
      'Keep the ritual, change the drink: a warm mug of herbal tea or decaf in the morning still feels like coffee time.',
      'Go for a short walk when the afternoon slump hits. Fresh air beats a double espresso.',
      'Watch for hidden caffeine in cola, energy drinks and black tea. They count too.',
      'Sleep a little earlier for the first few nights. Your body is catching up, so let it.',
    ],
    characterId: 'capu',
    avoid: ['coffee', 'latte', 'cappuccino', 'blackTea', 'energy', 'soda'],
  },
  {
    id: 'tea',
    title: 'Tea Toad',
    days: 10,
    color: '#8DC63F',
    deep: '#6DA226',
    tagline: 'Discover what a daily cup of tea can do for you.',
    rule: 'Drink at least one cup of tea every day.',
    intro:
      'Tea hydrates almost as well as water and comes with a long list of plant goodness. For ten days, enjoy at least one cup of tea every day alongside your water goal, and find a flavour you truly love.',
    benefits: [
      { emoji: '🛡️', text: 'Natural antioxidants. Green, black and herbal teas are full of plant compounds that help your body protect itself.' },
      { emoji: '❤️', text: 'Kind to your heart. Regular tea drinkers tend to have healthier blood pressure.' },
      { emoji: '🎯', text: 'Calm focus. Green tea has a little caffeine plus a soothing amino acid, so you stay alert without the jitters.' },
      { emoji: '🌿', text: 'Easy digestion. Peppermint, ginger and chamomile are great after a big meal.' },
    ],
    tips: [
      'Try a new kind every couple of days: green, black, herbal, matcha. There is a tea for every mood.',
      'Mind the water temperature. Green tea likes it a little below boiling, black tea likes it hot.',
      'Do not over-steep. Two to three minutes is usually plenty; longer gets bitter.',
      'Skip the sugar. A slice of lemon, ginger or a drop of honey brings out the flavour instead.',
      'Make a big jug of iced tea for warm days and keep it in the fridge.',
    ],
    characterId: 'tearex',
    requires: ['tea', 'blackTea', 'herbal', 'matcha'],
  },
  {
    id: 'nocheat',
    title: 'No Cheat Newt',
    days: 10,
    color: '#D23F5E',
    deep: '#A82744',
    tagline: 'Ten days with zero sugary soda.',
    rule: 'No soda, energy drinks or milkshakes.',
    intro:
      'A single can of soda can hold more sugar than you should have in a whole day. For ten days, no cheating: no soda, no energy drinks, no milkshakes. Reach for water, sparkling water or tea instead.',
    benefits: [
      { emoji: '🍬', text: 'Less sugar, fewer cravings. After a few days, sweet drinks start to taste way too sweet.' },
      { emoji: '⚖️', text: 'Fewer empty calories. Drinks add up fast, and you will not feel them missing.' },
      { emoji: '🦷', text: 'Healthier teeth. Sugar and acid together are the worst combination for your enamel.' },
      { emoji: '🔋', text: 'Steady energy. No more sugar spikes followed by a crash an hour later.' },
    ],
    tips: [
      'Sparkling water with a squeeze of lime scratches the fizzy itch.',
      'Do not keep soda at home. If it is not in the fridge, you will not grab it.',
      'Order water first when you eat out, before the menu tempts you.',
      'Read labels: "diet", "zero" and "light" drinks still keep the sweet habit alive.',
      'When a craving hits, drink a full glass of water and wait ten minutes. It usually passes.',
    ],
    characterId: 'cheeto',
    avoid: ['soda', 'energy', 'milkshake'],
  },
  {
    id: 'weightloss',
    title: 'Weight Loss Leaper',
    days: 10,
    color: '#3FA07A',
    deep: '#2A7F5E',
    tagline: 'Let water help you feel lighter.',
    rule: 'No soda, milkshakes, juice or alcohol.',
    intro:
      'Water has no calories and helps you feel full, which makes it the easiest helper for anyone trying to lose a little weight. For ten days, skip the calorie-heavy drinks and hit your water goal every day.',
    benefits: [
      { emoji: '🍽️', text: 'Natural appetite control. A glass of water before a meal helps you eat a little less without trying.' },
      { emoji: '🔥', text: 'A small metabolism boost. Your body uses energy to warm up cold water.' },
      { emoji: '🥤', text: 'No liquid calories. Juice, soda and alcohol add up faster than most people think.' },
      { emoji: '🏃', text: 'Better workouts. A hydrated body moves more easily and recovers faster.' },
    ],
    tips: [
      'Drink a full glass of water about half an hour before every meal.',
      'Swap sweet drinks for water or unsweetened tea, all ten days.',
      'Try cold water. It is refreshing and your body works a little to warm it up.',
      'Eat more water-rich foods like cucumber, melon, berries and soup.',
      'Lily does not count food, so be kind to yourself and eat well. Water does its part best alongside balanced meals.',
    ],
    characterId: 'sloth',
    avoid: ['soda', 'milkshake', 'juice', 'cocoa', 'energy', ...ALCOHOL],
  },
  {
    id: 'lactose',
    title: 'Lactose-Free Leapfrog',
    days: 10,
    color: '#E58AB8',
    deep: '#C2669A',
    tagline: 'Ten days of plant milks only.',
    rule: 'No dairy milk, milkshakes or yogurt drinks.',
    intro:
      'Many people feel bloated after dairy without ever connecting the dots. For ten days, swap cow’s milk for almond, oat or soy milk and see whether your tummy thanks you.',
    benefits: [
      { emoji: '🫧', text: 'A calmer tummy. Less bloating and discomfort if your body struggles with lactose.' },
      { emoji: '🌾', text: 'New flavours. Oat milk in coffee, almond in smoothies, soy in tea: each has its own taste.' },
      { emoji: '🌍', text: 'Kinder to the planet. Plant milks usually need less water and land to make.' },
      { emoji: '💪', text: 'Still nourishing. Many plant milks come with added calcium and vitamins.' },
    ],
    tips: [
      'Try a few plant milks before you pick a favourite. Oat is creamy, almond is light, soy has the most protein.',
      'Choose unsweetened versions to keep sugar low.',
      'Check labels on coffee drinks and sauces. Milk hides in lots of places.',
      'Shake the carton well. Plant milks settle, and the good stuff sinks to the bottom.',
      'Log your plant milk in Lily so you can see how it adds to your daily goal.',
    ],
    characterId: 'platy',
    avoid: ['milk', 'skimMilk', 'milkshake', 'yogurt', 'latte', 'cappuccino'],
  },
  {
    id: 'vitamin',
    title: 'Vitamin Tree Frog',
    days: 10,
    color: '#F29A38',
    deep: '#D0791B',
    tagline: 'Fresh juice or a smoothie, every single day.',
    rule: 'Have a juice or smoothie every day.',
    intro:
      'Fruits and vegetables are full of vitamins your body loves, and a glass of fresh juice or a smoothie is a delicious way to get them. For ten days, have at least one juice or smoothie a day on top of your water goal.',
    benefits: [
      { emoji: '🍊', text: 'A vitamin boost. Citrus, berries and greens bring vitamin C, folate and potassium.' },
      { emoji: '🛡️', text: 'Support for your immune system, especially when the weather turns cold.' },
      { emoji: '🥬', text: 'Sneaky veggies. A handful of spinach disappears into a fruit smoothie.' },
      { emoji: '😋', text: 'A tasty way to hydrate. Juice and smoothies count toward your daily goal.' },
    ],
    tips: [
      'Blend whole fruit instead of only juicing it. You keep the fibre and feel full longer.',
      'Add a vegetable to every smoothie: spinach, kale, carrot or cucumber.',
      'Keep portions to one glass a day. Fruit sugar is still sugar.',
      'Freeze chopped bananas and berries so a smoothie is always two minutes away.',
      'Drink it fresh. Vitamins fade the longer juice sits around.',
    ],
    characterId: 'puffin',
    requires: ['juice', 'smoothie'],
  },
  {
    id: 'sober',
    title: 'Sober Spring Peeper',
    days: 10,
    color: '#2F4A7A',
    deep: '#1E3358',
    tagline: 'Ten days, zero alcohol, all the good mornings.',
    rule: 'No beer, wine, cocktails or liquor.',
    intro:
      'Alcohol dries you out: your body loses more water than the drink gives back. For ten days, skip it completely and enjoy what clear mornings, deeper sleep and a fully hydrated body feel like.',
    benefits: [
      { emoji: '🌅', text: 'Clear mornings. No hangovers, no foggy starts, no lost Sundays.' },
      { emoji: '😴', text: 'Better sleep. Alcohol makes you drowsy but ruins the deep, restful part of the night.' },
      { emoji: '💧', text: 'Proper hydration. Every drink you skip is water your body gets to keep.' },
      { emoji: '🫀', text: 'A happier liver and heart. Even a short break gives them a rest.' },
      { emoji: '💰', text: 'More money in your pocket for something you will remember.' },
    ],
    tips: [
      'Plan your go-to order before you go out: sparkling water with lime, or a fancy mocktail.',
      'Tell your friends about the challenge. Most people will cheer you on.',
      'Find a new evening ritual, like a walk, a bath or a warm herbal tea.',
      'Notice your triggers. If a certain place or time makes you crave a drink, plan around it.',
      'Celebrate each day you finish. Ten days is a real achievement.',
    ],
    characterId: 'bear',
    avoid: ALCOHOL,
  },
  {
    id: 'sport',
    title: 'Sporty Hopper',
    days: 10,
    color: '#B5C548',
    deep: '#909F2C',
    tagline: 'Move every day, and drink to match.',
    rule: 'Move every day and finish your goal. No energy drinks or soda.',
    intro:
      'Exercise and water go together. When you move, you sweat, and every drop needs to come back. For ten days, get moving every day, even for twenty minutes, and finish your water goal to keep your muscles happy.',
    benefits: [
      { emoji: '🏃', text: 'Better performance. Even a little dehydration makes workouts feel much harder.' },
      { emoji: '🦵', text: 'Fewer cramps. Muscles need water to contract and relax smoothly.' },
      { emoji: '🔄', text: 'Faster recovery. Water helps carry nutrients to tired muscles after a workout.' },
      { emoji: '😊', text: 'A better mood. Moving every day and staying hydrated is a great mix for your head too.' },
    ],
    tips: [
      'Drink a glass of water about two hours before you exercise.',
      'Sip every 15 to 20 minutes while you move, not only when you feel thirsty.',
      'Sports drinks are fine after long or very sweaty sessions. Water is enough for the rest.',
      'Skip energy drinks. The caffeine and sugar dehydrate more than they help.',
      'Any movement counts: a brisk walk, a dance in the kitchen, ten hops after every glass.',
    ],
    characterId: 'meerkat',
    avoid: ['energy', 'soda'],
  },
  {
    id: 'nobeer',
    title: 'No Beer Bullfrog',
    days: 10,
    color: '#E3A43A',
    deep: '#BC811E',
    tagline: 'Swap the after-work beer for something fizzy and fresh.',
    rule: 'No beer for ten days.',
    intro:
      'An after-work beer feels like a reward, but it quietly adds calories and pulls water out of your body. For ten days, skip beer completely and find a new way to unwind.',
    benefits: [
      { emoji: '🍺', text: 'No beer belly. A pint can carry as many calories as a slice of pizza.' },
      { emoji: '😴', text: 'Better sleep, even after just a few beer-free nights.' },
      { emoji: '💧', text: 'Real hydration. Beer makes you lose more water than it gives back.' },
      { emoji: '🧠', text: 'Sharper mornings with no heavy head.' },
    ],
    tips: [
      'Try sparkling water in a tall glass with ice and lemon. It feels just like a cold pint.',
      'Alcohol-free beer is a great swap if you love the taste. Just log it as sparkling water.',
      'Change the routine: go for a walk or a swim after work instead of the pub.',
      'Have a big glass of water as soon as you get home. Thirst often feels like a craving.',
      'Count the money you save and treat yourself at the end.',
    ],
    characterId: 'deer',
    avoid: ['beer'],
  },
];

export function challengeById(id: string | undefined): Challenge | undefined {
  return CHALLENGES.find((x) => x.id === id);
}
