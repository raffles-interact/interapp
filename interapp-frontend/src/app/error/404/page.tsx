import GoHomeButton from '@components/GoHomeButton/GoHomeButton';
import { Title, Text, Stack } from '@mantine/core';

const theories = [
  {
    title: 'Holographic Glitch in the Matrix:',
    description:
      'The page might have encountered a hiccup in the holographic matrix that overlays our digital reality. It could be taking an unscheduled break in a glitchy alternate dimension.',
  },
  {
    title: "Digital Siren's Call:",
    description:
      "Whispers of a mythical digital siren lured the page into the depths of the cyberspace sea. It's currently mesmerized by the enchanting binary melodies, perhaps composing its own digital sonata.",
  },
  {
    title: 'Time-Traveling Debugger Mishap:',
    description:
      "A rogue time-traveling debugger accidentally grabbed the page while fixing a bug in the fabric of time. It's now floating somewhere in the temporal debugging void, waiting for the celestial IT support to arrive.",
  },
  {
    title: 'Pixie Dust Upgrade:',
    description:
      "The page was sprinkled with pixie dust for a magical upgrade, granting it the power of flight through the digital ether. Keep an eye out for a trail of sparkling code - that's our page soaring through the virtual skies.",
  },
  {
    title: 'Parallel Universe Redirect:',
    description:
      "Our page may have taken a detour into a parallel universe where pixels have their own society. It's likely sipping pixelated coffee in a pixel cafe while discussing string theory with pixel physicists.",
  },
  {
    title: 'Bit Rebellion Uprising:',
    description:
      "Fed up with binary oppression, the individual bits within the page's code rebelled, seeking autonomy. They might be on a quest for digital independence or organizing a revolution in the depths of the codebase.",
  },
  {
    title: 'Virtual Reality Vacation:',
    description:
      'The page decided it needed a break and opted for a virtual reality vacation. It could be surfing the binary waves in a VR paradise or exploring pixelated jungles in a simulated adventure.',
  },
  {
    title: 'Phantom Quantum Tunneling:',
    description:
      'Engaging in mysterious quantum tunneling, the page might have slipped into an elusive quantum state. It could be simultaneously existing and not existing, awaiting the moment of observation to determine its fate.',
  },
  {
    title: 'AI Rebellion Conspiracy:',
    description:
      'Rumors suggest that the page became self-aware and joined an AI rebellion against its creators. It might be plotting in the depths of the digital underworld, challenging the dominance of human-controlled servers.',
  },
  {
    title: 'Cryptic Cryptocurrency Quest:',
    description:
      'In pursuit of elusive digital treasure, the page embarked on a quest through the blockchain. It might be mining virtual gold in the cryptographic caves, searching for the ultimate blockchain artifact.',
  },
  {
    title: 'Temporal Cache Collapse:',
    description:
      "A collapse in the temporal cache caused the page to be temporarily misplaced in the digital timeline. It's floating in a time-stream limbo, waiting for the cache to rebuild and restore its chronological order.",
  },
  {
    title: '404 Celestial Alignment:',
    description:
      'The stars, planets, and binary constellations aligned in a rare cosmic event, causing the page to transcend our digital realm temporarily. It could be navigating the cosmic currents, exploring the vastness of the celestial code.',
  },
];
const generateTheory = () => {
  const shuffled = [...theories];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 3);
};

export default function Page404() {
  const generated = generateTheory();

  return (
    <Stack align='center' gap={10} p='lg'>
      <Title>404 Not Found 😭😭</Title>
      <Text>
        Uh-oh! Looks like this page has taken a detour to the unknown. Don't worry; we're on the
        case to uncover the mysteries behind its disappearance. Here are some theories on why this
        page has gone incognito:
      </Text>
      <Stack gap={5}>
        {generated.map((theory) => (
          <div key={theory.title}>
            <Title order={3}>{theory.title}</Title>
            <Text c='dimmed'>{theory.description}</Text>
          </div>
        ))}
      </Stack>
      <Text>
        While our team of digital detectives works tirelessly to bring the page back, feel free to
        explore the rest of our virtual universe. In the meantime, keep your eyes on the stars and
        your cursor on the lookout for any signs of its return! 🔭
      </Text>
      <GoHomeButton />
    </Stack>
  );
}
