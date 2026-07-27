export interface AnimeAvatar {
  id: string;
  name: string;
  anime: string;
  url: string;
  fallbackColor: string;
}

export const PRESET_ANIME_AVATARS: AnimeAvatar[] = [
  {
    id: "goku",
    name: "Son Goku",
    anime: "Dragon Ball Z",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Goku&backgroundColor=b6e3f4,c0aede,d1d4f9",
    fallbackColor: "from-amber-500 to-orange-600",
  },
  {
    id: "luffy",
    name: "Monkey D. Luffy",
    anime: "One Piece",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Luffy&backgroundColor=ffdfbf,ffd5dc,c0aede",
    fallbackColor: "from-red-500 to-rose-600",
  },
  {
    id: "naruto",
    name: "Naruto Uzumaki",
    anime: "Naruto Shippuden",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Naruto&backgroundColor=ffd5dc,ffdfbf,d1d4f9",
    fallbackColor: "from-orange-500 to-yellow-500",
  },
  {
    id: "saitama",
    name: "Saitama",
    anime: "One Punch Man",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Saitama&backgroundColor=b6e3f4,c0aede",
    fallbackColor: "from-yellow-400 to-amber-600",
  },
  {
    id: "gojo",
    name: "Satoru Gojo",
    anime: "Jujutsu Kaisen",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Gojo&backgroundColor=c0aede,d1d4f9",
    fallbackColor: "from-cyan-500 to-blue-600",
  },
  {
    id: "levi",
    name: "Levi Ackerman",
    anime: "Attack on Titan",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Levi&backgroundColor=b6e3f4,d1d4f9",
    fallbackColor: "from-emerald-600 to-teal-700",
  },
  {
    id: "eren",
    name: "Eren Yeager",
    anime: "Attack on Titan",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Eren&backgroundColor=ffd5dc,ffdfbf",
    fallbackColor: "from-stone-600 to-slate-800",
  },
  {
    id: "tanjiro",
    name: "Tanjiro Kamado",
    anime: "Demon Slayer",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Tanjiro&backgroundColor=b6e3f4,c0aede",
    fallbackColor: "from-teal-500 to-green-700",
  },
  {
    id: "nezuko",
    name: "Nezuko Kamado",
    anime: "Demon Slayer",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Nezuko&backgroundColor=ffd5dc,c0aede",
    fallbackColor: "from-pink-500 to-rose-600",
  },
  {
    id: "frieren",
    name: "Frieren",
    anime: "Frieren: Beyond Journey's End",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Frieren&backgroundColor=d1d4f9,b6e3f4",
    fallbackColor: "from-purple-400 to-indigo-600",
  },
  {
    id: "makima",
    name: "Makima",
    anime: "Chainsaw Man",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Makima&backgroundColor=ffd5dc,ffdfbf",
    fallbackColor: "from-rose-600 to-red-700",
  },
  {
    id: "l-lawliet",
    name: "L Lawliet",
    anime: "Death Note",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=L&backgroundColor=c0aede,b6e3f4",
    fallbackColor: "from-slate-700 to-black",
  },
  {
    id: "violet",
    name: "Violet Evergarden",
    anime: "Violet Evergarden",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Violet&backgroundColor=d1d4f9,ffd5dc",
    fallbackColor: "from-indigo-400 to-purple-600",
  },
  {
    id: "spike",
    name: "Spike Spiegel",
    anime: "Cowboy Bebop",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Spike&backgroundColor=b6e3f4,c0aede",
    fallbackColor: "from-blue-600 to-indigo-800",
  },
  {
    id: "mikasa",
    name: "Mikasa Ackerman",
    anime: "Attack on Titan",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Mikasa&backgroundColor=ffd5dc,d1d4f9",
    fallbackColor: "from-slate-600 to-zinc-800",
  },
];
