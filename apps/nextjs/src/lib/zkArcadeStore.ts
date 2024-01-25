import type { CarouselApi } from "@/components/ui/carousel";
import type { CarouselGameInfo, GameNames } from "@/lib/constants";
import { gameInfoMap } from "@/lib/constants";
import { create } from "zustand";

interface ZkArcadeState {
  carouselApi: CarouselApi;
  activeGame: CarouselGameInfo;
  setCarouselApi: (api: CarouselApi) => void;
  getCarouselApi: () => [CarouselApi, (api: CarouselApi) => void];
  setActiveGame: (game: GameNames) => void;
}

export const useZkArcade = create<ZkArcadeState>()((set, get) => ({
  carouselApi: undefined,
  activeGame: gameInfoMap.get("Hot 'n Cold")!,
  games: gameInfoMap,
  setCarouselApi: (api: CarouselApi) => {
    set({ carouselApi: api });
  },
  getCarouselApi: () => {
    const { carouselApi, setCarouselApi } = get();
    // carouselApi.carouselApi;
    // const setCarouselApi = useZkArcade.getState().setCarouselApi;

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
}));
