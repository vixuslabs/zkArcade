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

export const boxes = [
  {
    vertices: {
      "0": -0.27666425704956055,
      "1": -0.5211271047592163,
      "2": -0.7214387655258179,
      "3": 0.27666449546813965,
      "4": -0.5211271047592163,
      "5": -0.7214387655258179,
      "6": 0.27666449546813965,
      "7": -0.5211271047592163,
      "8": 2.384185791015625e-7,
      "9": -0.27666425704956055,
      "10": -0.5211271047592163,
      "11": 2.384185791015625e-7,
      "12": -0.27666425704956055,
      "13": 0.5211268663406372,
      "14": -0.7214387655258179,
      "15": 0.27666449546813965,
      "16": 0.5211268663406372,
      "17": -0.7214387655258179,
      "18": 0.27666449546813965,
      "19": 0.5211268663406372,
      "20": 2.384185791015625e-7,
      "21": -0.27666425704956055,
      "22": 0.5211268663406372,
      "23": 2.384185791015625e-7,
    },
    indices: {
      "0": 0,
      "1": 1,
      "2": 2,
      "3": 0,
      "4": 2,
      "5": 3,
      "6": 4,
      "7": 6,
      "8": 5,
      "9": 4,
      "10": 7,
      "11": 6,
      "12": 0,
      "13": 4,
      "14": 1,
      "15": 1,
      "16": 4,
      "17": 5,
      "18": 1,
      "19": 5,
      "20": 2,
      "21": 2,
      "22": 5,
      "23": 6,
      "24": 2,
      "25": 6,
      "26": 3,
      "27": 3,
      "28": 6,
      "29": 7,
      "30": 3,
      "31": 7,
      "32": 0,
      "33": 0,
      "34": 7,
      "35": 4,
    },
    matrix: [
      0.006392898038029671, 2.9135346579778343e-8, 0.9999794363975525, 0,
      0.9999794363975525, -8.432591158680225e-8, -0.0063927737064659595, 0,
      2.0851992132975283e-7, 0.9999998807907104, 9.391553845716771e-8, 0,
      0.22366495430469513, 0.7948658466339111, -0.599656343460083, 1,
    ],
  },
  // {
  //   "vertices": {
  //     "0": -0.2948755621910095,
  //     "1": -0.6206405162811279,
  //     "2": -0.7228622436523438,
  //     "3": 0.2948758006095886,
  //     "4": -0.6206405162811279,
  //     "5": -0.7228622436523438,
  //     "6": 0.2948758006095886,
  //     "7": -0.6206405162811279,
  //     "8": 3.5762786865234375e-7,
  //     "9": -0.2948755621910095,
  //     "10": -0.6206405162811279,
  //     "11": 3.5762786865234375e-7,
  //     "12": -0.2948755621910095,
  //     "13": 0.6206402778625488,
  //     "14": -0.7228622436523438,
  //     "15": 0.2948758006095886,
  //     "16": 0.6206402778625488,
  //     "17": -0.7228622436523438,
  //     "18": 0.2948758006095886,
  //     "19": 0.6206402778625488,
  //     "20": 3.5762786865234375e-7,
  //     "21": -0.2948755621910095,
  //     "22": 0.6206402778625488,
  //     "23": 3.5762786865234375e-7
  // },
  //   "indices": {
  //     "0": 0,
  //     "1": 1,
  //     "2": 2,
  //     "3": 0,
  //     "4": 2,
  //     "5": 3,
  //     "6": 4,
  //     "7": 6,
  //     "8": 5,
  //     "9": 4,
  //     "10": 7,
  //     "11": 6,
  //     "12": 0,
  //     "13": 4,
  //     "14": 1,
  //     "15": 1,
  //     "16": 4,
  //     "17": 5,
  //     "18": 1,
  //     "19": 5,
  //     "20": 2,
  //     "21": 2,
  //     "22": 5,
  //     "23": 6,
  //     "24": 2,
  //     "25": 6,
  //     "26": 3,
  //     "27": 3,
  //     "28": 6,
  //     "29": 7,
  //     "30": 3,
  //     "31": 7,
  //     "32": 0,
  //     "33": 0,
  //     "34": 7,
  //     "35": 4
  // },
  //   "matrix": [
  //     -0.045580197125673294,
  //     -1.1646082498373289e-7,
  //     -0.9989607930183411,
  //     0,
  //     -0.9989607930183411,
  //     3.119856728517334e-8,
  //     0.04558010399341583,
  //     0,
  //     1.1646082498373289e-7,
  //     1.0000001192092896,
  //     -2.1259305071907875e-7,
  //     0,
  //     -1.1729872226715088,
  //     0.7958728075027466,
  //     -0.5786142945289612,
  //     1
  // ]
  // }
];

export const planes = [
  // {
  //   "position": {
  //       "0": -0.9790574908256531,
  //       "1": -7.569404054019648e-17,
  //       "2": -1.2361774444580078,
  //       "3": -0.9790574908256531,
  //       "4": 7.569402068786178e-17,
  //       "5": 1.2361772060394287,
  //       "6": 0.9790571331977844,
  //       "7": 7.569402068786178e-17,
  //       "8": 1.2361772060394287,
  //       "9": 0.9790571331977844,
  //       "10": -7.569404054019648e-17,
  //       "11": -1.2361774444580078
  //   },
  //   "normal": {
  //     "0": 0,
  //     "1": -1,
  //     "2": 6.123234262925839e-17,
  //     "3": 0,
  //     "4": -1,
  //     "5": 6.123234262925839e-17,
  //     "6": 0,
  //     "7": -1,
  //     "8": 6.123234262925839e-17,
  //     "9": 0,
  //     "10": -1,
  //     "11": 6.123234262925839e-17
  //   },
  //   "uv": {
  //     "0": 0,
  //     "1": 0,
  //     "2": 0,
  //     "3": 1,
  //     "4": 1,
  //     "5": 1,
  //     "6": 1,
  //     "7": 0
  //   },
  //   "matrix": [
  //     -0.08696980774402618,
  //     0.0018209785921499133,
  //     0.9962093234062195,
  //     0,
  //     0.9962109923362732,
  //     -1.0623874402426736e-7,
  //     0.08696991205215454,
  //     0,
  //     0.00015844027802813798,
  //     0.9999983906745911,
  //     -0.001814108807593584,
  //     0,
  //     1.0200589895248413,
  //     1.229479432106018,
  //     0.239743173122406,
  //     1
  //   ]
  // },
  // {
  //   "position": {
  //     "0": -0.8525468111038208,
  //     "1": -7.569402068786178e-17,
  //     "2": -1.2361772060394287,
  //     "3": -0.8525468111038208,
  //     "4": 7.569405377508628e-17,
  //     "5": 1.236177682876587,
  //     "6": 0.8525468111038208,
  //     "7": 7.569405377508628e-17,
  //     "8": 1.236177682876587,
  //     "9": 0.8525468111038208,
  //     "10": -7.569402068786178e-17,
  //     "11": -1.2361772060394287
  // },
  //   "normal": {
  //     "0": 0,
  //     "1": -1,
  //     "2": 6.123234262925839e-17,
  //     "3": 0,
  //     "4": -1,
  //     "5": 6.123234262925839e-17,
  //     "6": 0,
  //     "7": -1,
  //     "8": 6.123234262925839e-17,
  //     "9": 0,
  //     "10": -1,
  //     "11": 6.123234262925839e-17
  // },
  //   "uv": {
  //     "0": 0,
  //     "1": 0,
  //     "2": 0,
  //     "3": 1,
  //     "4": 1,
  //     "5": 1,
  //     "6": 1,
  //     "7": 0
  // },
  //   "matrix": [
  //     0.25365588068962097,
  //     -0.0019106577383354306,
  //     -0.9672926068305969,
  //     0,
  //     -0.9672943949699402,
  //     0.000020900164599879645,
  //     -0.2536563575267792,
  //     0,
  //     0.000504857103805989,
  //     0.999998152256012,
  //     -0.0018428594339638948,
  //     0,
  //     -2.06693696975708,
  //     1.2315490245819092,
  //     -0.5162055492401123,
  //     1
  //   ]
  // },
  // {
  //   "position": {
  //     "0": -1.671811819076538,
  //     "1": -7.569402730530668e-17,
  //     "2": -1.2361773252487183,
  //     "3": -1.671811819076538,
  //     "4": 7.569402730530668e-17,
  //     "5": 1.2361773252487183,
  //     "6": 1.6718103885650635,
  //     "7": 7.569402730530668e-17,
  //     "8": 1.2361773252487183,
  //     "9": 1.6718103885650635,
  //     "10": -7.569402730530668e-17,
  //     "11": -1.2361773252487183
  // },
  //   "normal": {
  //     "0": 0,
  //     "1": -1,
  //     "2": 6.123234262925839e-17,
  //     "3": 0,
  //     "4": -1,
  //     "5": 6.123234262925839e-17,
  //     "6": 0,
  //     "7": -1,
  //     "8": 6.123234262925839e-17,
  //     "9": 0,
  //     "10": -1,
  //     "11": 6.123234262925839e-17
  // },
  //   "uv": {
  //     "0": 0,
  //     "1": 0,
  //     "2": 0,
  //     "3": 1,
  //     "4": 1,
  //     "5": 1,
  //     "6": 1,
  //     "7": 0
  // },
  //   "matrix": [
  //     -0.9623530507087708,
  //     -0.00017996762471739203,
  //     -0.2718043029308319,
  //     0,
  //     -0.2718043327331543,
  //     -3.052297756767075e-7,
  //     0.9623528122901917,
  //     0,
  //     -0.000173208347405307,
  //     1.000000238418579,
  //     -0.00004910530333290808,
  //     0,
  //     -0.6735067367553711,
  //     1.232094168663025,
  //     0.7614047527313232,
  //     1
  //   ]
  // },
  // {
  //   "position": {
  //     "0": -1.508525013923645,
  //     "1": -7.569402730530668e-17,
  //     "2": -1.2361773252487183,
  //     "3": -1.508525013923645,
  //     "4": 7.569404715764138e-17,
  //     "5": 1.2361775636672974,
  //     "6": 1.5085252523422241,
  //     "7": 7.569404715764138e-17,
  //     "8": 1.2361775636672974,
  //     "9": 1.5085252523422241,
  //     "10": -7.569402730530668e-17,
  //     "11": -1.2361773252487183
  // },
  //   "normal": {
  //     "0": 0,
  //     "1": -1,
  //     "2": 6.123234262925839e-17,
  //     "3": 0,
  //     "4": -1,
  //     "5": 6.123234262925839e-17,
  //     "6": 0,
  //     "7": -1,
  //     "8": 6.123234262925839e-17,
  //     "9": 0,
  //     "10": -1,
  //     "11": 6.123234262925839e-17
  // },
  //   "uv": {
  //     "0": 0,
  //     "1": 0,
  //     "2": 0,
  //     "3": 1,
  //     "4": 1,
  //     "5": 1,
  //     "6": 1,
  //     "7": 0
  // },
  //   "matrix": [
  //     0.9796847701072693,
  //     -0.0004966941778548062,
  //     0.20054292678833008,
  //     0,
  //     0.20054294168949127,
  //     -0.000015530595192103647,
  //     -0.9796851277351379,
  //     0,
  //     0.0004896794562228024,
  //     1.0000001192092896,
  //     0.00008438946679234505,
  //     0,
  //     -0.3729037642478943,
  //     1.2285659313201904,
  //     -1.0384151935577393,
  //     1
  //   ]
  // }
];
