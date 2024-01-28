import type { CarouselApi } from "@/components/ui/carousel";
import { gameInfoMap } from "@/lib/constants";
import type { CarouselGameInfo, GameNames } from "@/lib/types";
import { create } from "zustand";

interface ZkArcadeState {
  carouselApi: CarouselApi;
  activeGame: CarouselGameInfo;
  matchPath: string;
  setCarouselApi: (api: CarouselApi) => void;
  getCarouselApi: () => [CarouselApi, (api: CarouselApi) => void];
  setActiveGame: (game: GameNames) => void;
  setMatchPath: (username: string, id: string) => void;
}

export const useZkArcade = create<ZkArcadeState>()((set, get) => ({
  carouselApi: undefined,
  activeGame: gameInfoMap.get("Hot 'n Cold")!,
  games: gameInfoMap,
  matchPath: "",
  setCarouselApi: (api: CarouselApi) => {
    set({ carouselApi: api });
  },
  getCarouselApi: () => {
    const { carouselApi, setCarouselApi } = get();

    return [carouselApi, setCarouselApi];
  },
  setActiveGame: (gameName: GameNames) => {
    console.log("setting active game to: ", gameName);
    const gameInfo = gameInfoMap.get(gameName);
    if (!gameInfo) {
      console.error(`gameInfo not found for gameName: ${gameName}`);
    }
    if (gameInfo) {
      console.log(`gameInfo.name: ${gameInfo.name}`);
      set({ activeGame: gameInfo });
    }
  },
  setMatchPath: (username: string, id: string) => {
    const path = `/play/${username}/${id}`;

    set({ matchPath: path });
  },
}));
