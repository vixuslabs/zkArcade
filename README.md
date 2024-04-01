# zkArcade

## Welcome!

Hey there! Thanks for checking out zkArcade, our project submission for the [Mina Navigators Program](https://minafoundation.notion.site/Mina-Navigators-Program-Information-e8d0490aa0e04c28b061887a8cc22f9a).

zkArcade focuses on XR games of incomplete information (also known as fog-of-war games) built on top of [Mina](https://minaprotocol.com/)'s zero knowledge technology. Mina blockchain uses zero knowledge proofs to create a private and secure infrastructure to run zero-knowledge applications or "zkApps".

The private nature of the Mina blockchain makes it possible to build games of incomplete information that don't rely on trust between the players, but instead use the power of zero knowledge proofs to enforce the rules of the game.

## Games

- ### [Hot 'n Cold](./docs/HotnCold.md): A Thrilling XR Hide-and-Seek Game

  Welcome to **Hot 'n Cold**, a [WebXR](https://immersive-web.github.io/webxr-samples/) built for the Meta Quest 3, but playable with any VR device with `mesh-detection`, `plane-detection`, and `hand-tracking` capabilities.

  Hot 'n Cold works like this:

  - Both players sync into their room, and then send their spatial data information to their opponent (only what is absolutely required).
  - The game then starts, and you are dropped in a vr-esque set up of your opponent's room. Your job is to hide a virtual ball in their room, and then hide it.
  - Then once, both players are done, you are "brought" back to you room, and your whole room is "dark"
  - With the flashlight in your right hand, find the object before your opponent and win!

  #### How is Mina used in Hot 'n Cold?

  - With your room's layout and the position of where your opponent hid the ball, we are essentially validating the the ball is not inside a peice of furniture, or outside your room. This ensure that the game is fair and that the ball is actually hidden in a valid location.

  🔦 _Learn more [here](./docs/HotnCold.md)_

## Sandbox Mode

Wanna just mess around? Jump into our sandbox mode. Play with a virtual ball, check out how cool WebXR is, and just have fun with the physics in your own space. Also for people that don't have anyone to play with.

**Hint** Drop your controllers and use your hands instead 🤫

**Note**: this is a work in progress so expect some bugs. If the sandbox seems to break just refresh the page!

### Give it a try

Head to [https://zkarcade.vixuslabs.com](https://zkarcade.vixuslabs.com/) to try out Hot 'n Cold and our Sandbox. Again, some features tend to break so please forgive us. It will get better :)

## Projects That Made this Possible

- [Mina](https://minaprotocol.com/)
- [React](https://react.dev/)
- [Nextjs](https://nextjs.org/)
- [@react-three/fiber](https://github.com/pmndrs/react-three-fiber)
- [@coconut-xr](https://www.coconut-xr.com/)
- [Clerk](https://clerk.com/)
- [Planetscale](https://planetscale.com/)

## License

[Apache License]("https://raw.githubusercontent.com/0xtito/hot-n-cold/main/LICENSE.MD")

---
