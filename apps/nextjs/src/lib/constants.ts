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

export const gameNames: GameNames[] = [
  "Hot 'n Cold",
  "zkBattleship",
  "zkTicTacToe",
  "Sandbox",
];

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
  {
    name: "zkBattleship",
    mainDescription: `This is like the original Battleship game we all know and love, yet upgraded. The game is played in mixed reality, with your board right in front of you, and the ships as grabbable objects. Start the game by placing your ships on your board. The game is played in rounds, where each player takes a turn guessing a coordinate on the grid. If the coordinate is a hit, the player gets to guess again. The first player to sink all of their opponent's ships wins!`,
    zkDescription:
      "Like the board game, you are not allowed to see your opponents board. However, since this is an online game, and I do not see the other persons board, how can I assure they did not move their ships. We do this by commiting the hash of all of the ships positions to the blockchain. Then, once the game starts, we validate that the ships are in the correct positions.",
    imageUrl: "/thumbnails/zkBattleship.png",
  },
  {
    name: "zkTicTacToe",
    mainDescription: `Play a game of tic tac toe with your opponent, with a twist. It is blind tic tac toe, meaning you cannot see your or your opponnents board. You can only see the board when you are placing your piece. The first player to get three in a row wins!`,
    zkDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed elementum tempus egestas sed sed risus pretium quam.",
    imageUrl: "/thumbnails/zkTicTacToe.png",
  },
];

export const gameInfoMap = new Map<GameNames, CarouselGameInfo>(
  carouselGamesInfo.map((game) => [game.name, game]),
);

export const GAME_VERIFICATION_KEYS = new Map<GameNames, string>([
  ["Hot 'n Cold", HOTNCOLD_ADDRESS],
  ["zkBattleship", "B62qo1qSixN7vRuXdkpuVfDMBEqCgmREjWrNB2ibpwk6SdsaU7NAwWL"],
]);
