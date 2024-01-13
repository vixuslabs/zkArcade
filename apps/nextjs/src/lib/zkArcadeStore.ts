import type { CarouselApi } from "@/components/ui/carousel";
import type { CarouselGameInfo, GameNames } from "@/lib/constants";
import { carouselGamesInfo, gameInfoMap } from "@/lib/constants";
// import type { UseEmblaCarouselType } from "embla-carousel-react";
import { create } from "zustand";

interface ZkArcadeState {
  carouselApi: CarouselApi;
  activeGame: CarouselGameInfo;
  setCarouselApi: (api: CarouselApi) => void;
  getCarouselApi: () => [CarouselApi, (api: CarouselApi) => void];
  setActiveGame: (game: GameNames) => void;
}

carouselGamesInfo.forEach((gameInfo) => {
  console.log(`inside forEach - gameInfo.name: ${gameInfo.name}`);
  gameInfoMap.set(gameInfo.name as GameNames, gameInfo);
});

// for (const gameInfo of carouselGamesInfo) {
//   gameInfoMap.set(gameInfo.name as GameNames, gameInfo);
// }

// const zkArcadeInitialState: ZkArcadeState = {
// carouselApi: undefined,
// };

// export const useZkArcade = create(
//   combine(zkArcadeInitialState, (set, get) => ({
//     setCarouselApi: (api: CarouselApi) => {
//       set({ carouselApi: api as CarouselApi });
//     },
//     getCarouselApi: () => {
//       const carouselApi = get().carouselApi;
//       const setCarouselApi = useZkArcade.getState().setCarouselApi;

//       return [carouselApi, setCarouselApi];
//     },
//   })),
// );

export const useZkArcade = create<ZkArcadeState>()((set, get) => ({
  carouselApi: undefined,
  activeGame: carouselGamesInfo[0]!,
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
