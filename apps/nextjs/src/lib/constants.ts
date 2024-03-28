import type { CarouselGameInfo, GameNames, Pointers } from "@/lib/types";

export const initialPointerState: Pointers = {
  left: {
    z: 0,
    state: "NOT_SET",
    heldObject: null,
  },
  right: {
    z: 0,
    state: "NOT_SET",
    heldObject: null,
  },
};

export const HOTNCOLD_ADDRESS =
  "B62qo1qSixN7vRuXdkpuVfDMBEqCgmREjWrNB2ibpwk6SdsaU7NAwWL" as string;

export const realWorldHiddenObject = {
  coords: [0.5, 0.5, -0.5],
  radius: 0.02,
};

export const gameNames: GameNames[] = ["Hot 'n Cold", "Sandbox"];

export const carouselGamesInfo: CarouselGameInfo[] = [
  {
    name: "Hot 'n Cold",
    mainDescription: `Hide an object in your opponent's room as they hide one in yours. Once both players have successfully hidden the object, the first to find the object in their room wins!`,
    zkDescription:
      "Once the player has hidden their object, the hash of the object's position vector is commited to the blockchain. Then the object's position is validated against the players room, essentially ensuring the object is inside of the room and not inside any object in the room.",
    imageUrl: "/thumbnails/hotnCold.png",
  },
  {
    name: "Sandbox",
    mainDescription: `Play around with the tools and objects in your room. Meant to be a fun and quick environment to test out mixed reality in your room!`,
    zkDescription: "No zk stuff going on here, just a sandbox.",
    imageUrl: "/thumbnails/sandbox.png",
  },
];

export const gameInfoMap = new Map<GameNames, CarouselGameInfo>(
  carouselGamesInfo.map((game) => [game.name, game]),
);

export const GAME_VERIFICATION_KEYS = new Map<GameNames, string>([
  ["Hot 'n Cold", HOTNCOLD_ADDRESS],
]);
