import { ArcadeScene } from "@/components/client/arcade";
import ArcadeCanvas from "@/components/client/arcade/ArcadeCanvas";

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
