"use client";

import React, { Suspense } from "react";
import { PerspectiveCamera, useProgress } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Perf } from "r3f-perf";

import { AnimatedCamera, ArcadeMachine, Floor, PendantLamp } from ".";

function ArcadeScene() {
  const arcadeMachineRef = React.useRef<THREE.Mesh>(null);
  const { active, progress, errors, item, loaded, total } = useProgress();

  const [isLoaded, setIsLoaded] = React.useState(false);

  useFrame(() => {
    if (loaded === total) {
      console.log("loaded");
      setIsLoaded(true);
      return;
    }

    console.log("\n--------- START ------------");
    console.log("active:", active);
    console.log("progress:", progress);
    console.log("errors:", errors);
    console.log("item:", item);
    console.log("loaded:", loaded);
    console.log("total:", total);
    console.log("--------- END ------------\n");
  });

  return (
    <>
      <Perf position="top-left" />

      {/* <OrbitControls makeDefault /> */}

      <PerspectiveCamera makeDefault position={[0, 0.25, 50]} />

      <ambientLight intensity={0.8} />

      <AnimatedCamera
        positionStart={[0, 0.25, 50]}
        positionEnd={[0, 0.25, 2]}
        isLoaded={isLoaded}
      />

      {/* <mesh
        receiveShadow
        position-y={-0.48}
        position-z={20}
        rotation-x={-Math.PI * 0.5}
        scale={10}
      >
        <planeGeometry args={[1, 10]} />
        <MeshReflectorMaterial
          mirror={0}
          color="#878790"
          blur={[400, 400]}
          resolution={256}
          mixBlur={1}
          mixStrength={1}
          mixContrast={1}
          depthScale={1}
          minDepthThreshold={0.85}
          metalness={0}
          roughness={1}
        />
      </mesh> */}

      <Suspense fallback={null}>
        <Floor />
      </Suspense>

      <Suspense fallback={null}>
        {/* @ts-expect-error - ref works */}
        <ArcadeMachine ref={arcadeMachineRef} />
      </Suspense>

      <Suspense fallback={null}>
        <PendantLamp arcadeMachine={arcadeMachineRef} position-y={2} />
      </Suspense>
    </>
  );
}

export default ArcadeScene;
