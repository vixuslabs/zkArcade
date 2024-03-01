"use client";

import React, { useEffect, useMemo, useRef } from "react";
// import { Box } from "@react-three/drei";
import { ArcadeMachine, PendantLamp } from "../arcade";
// import { ArcadeMachine, PendantLamp, Floor } from "../arcade";

import { PerspectiveCamera } from "@react-three/drei";

import { Vector3 } from "three";

export const ArcadeScene = () => {
  const camera = useRef<THREE.Camera>(null);
  const arcadeMachine = useRef<THREE.Mesh>(null);
  const lookAtVector = useMemo(() => new Vector3(0.5, 0, 3.5), []);

  useEffect(() => {
    if (camera.current) {
      camera.current.lookAt(lookAtVector);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  return (
    <>
      {/* {mounted && <PerfWrapperDynamic />} */}
      <PerspectiveCamera
        // @ts-expect-error - it is of type camera
        ref={camera}
        makeDefault
        filmOffset={-12}
        position={[0.5, 0, 6.5]}
        fov={50}
      />

      {/* <Floor floorSize={[30, 0.1, 55]} /> */}
      <mesh position={[0, -0.56, 20]}>
        <boxGeometry args={[30, 0.1, 55]} />
        <meshStandardMaterial transparent opacity={0.1} color="grey" />
      </mesh>
      <PendantLamp arcadeMachine={arcadeMachine} position={[0.5, 1, 3.5]} />
      {/* @ts-expect-error - ref works */}
      <ArcadeMachine ref={arcadeMachine} position={[0.5, 0, 3.5]} />
    </>
  );
};
