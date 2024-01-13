"use client";

import React, { useMemo } from "react";
import { useSpring } from "@react-spring/three";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";

interface AnimatedCameraProps {
  positionStart: [number, number, number];
  positionEnd: [number, number, number];
  isLoaded: boolean;
}

function AnimatedCamera({
  positionStart,
  positionEnd,
  isLoaded,
}: AnimatedCameraProps) {
  const camera = useThree((state) => state.camera);
  const pos = useMemo(() => new Vector3(), []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [props, api] = useSpring(
    () => ({
      //   position: positionEnd,
      from: { position: positionStart },
      to: { position: positionEnd },
      config: {
        precision: 0.0001,
        duration: 5000,
        decay: true,
        damping: 0.5,
        frequency: 2,
      },
    }),
    [],
  );

  useFrame(() => {
    // if (!isLoaded) {
    //   api.pause();
    // } else {
    //   api.start();
    // }

    // if (api.)

    if (isLoaded) {
      pos.set(
        props.position.get()[0],
        props.position.get()[1],
        props.position.get()[2],
      );

      camera.position.lerp(pos, 0.1);
    }
  });

  return <></>;
}

export default AnimatedCamera;
