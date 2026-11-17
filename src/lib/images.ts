import { blackSapphireStone as blackSapphire, chaandRaatSky as chaandRaat, goldFoil, laalWhisper, limeWash, mahroosaJali, pearlCottonPaper as pearlPaper, satin, velvetFabric as velvet, zardoziLattice as zardozi } from "@/assets/data/textures";

/** Brand textures. Used as labelled placeholders until real photography exists. */
export const textures = {
  "black-sapphire-stone": { src: blackSapphire, label: "Black sapphire stone texture", tone: "dark" },
  "chaand-raat-sky": { src: chaandRaat, label: "Chaand raat sky texture", tone: "dark" },
  "gold-foil": { src: goldFoil, label: "Gold foil texture", tone: "light" },
  "laal-whisper": { src: laalWhisper, label: "Laal whisper texture", tone: "dark" },
  "lime-wash": { src: limeWash, label: "Lime wash plaster texture", tone: "light" },
  "mahroosa-jali": { src: mahroosaJali, label: "Mahroosa jali pattern", tone: "dark" },
  "pearl-cotton-paper": { src: pearlPaper, label: "Pearl cotton paper texture", tone: "light" },
  satin: { src: satin, label: "Satin cloth texture", tone: "dark" },
  "velvet-fabric": { src: velvet, label: "Velvet cloth texture", tone: "dark" },
  "zardozi-lattice": { src: zardozi, label: "Zardozi lattice pattern", tone: "light" },
} as const;

export type TextureKey = keyof typeof textures;
export const tex = (k: TextureKey) => textures[k].src;
