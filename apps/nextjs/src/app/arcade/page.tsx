import { ArcadeScene } from "@/components/landingPage/arcade";
import ArcadeCanvas from "@/components/landingPage/arcade/ArcadeCanvas";

export default function ArcadePage() {
  return (
    <>
      {/* <h1>Arcade</h1> */}
      <ArcadeCanvas
        gl={{
          antialias: true,
        }}
        camera={{
          fov: 75,
          // near: 0.1,
          position: [0, 0.25, 50],
          far: 200,
        }}
      >
        <ArcadeScene />
      </ArcadeCanvas>
    </>
  );
}
