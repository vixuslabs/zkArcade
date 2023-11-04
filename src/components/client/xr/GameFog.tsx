"use client";

import React, { useEffect, useState } from "react";

import { useThree, useFrame } from "@react-three/fiber";
import { createPortal } from "@react-three/fiber";
import { ArrayCamera } from "three";
import { useXR } from "@coconut-xr/natuerlich/react";
import { FogExp2 } from "three";

function GameFog() {
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const xr = useXR();

  // useEffect(() => {
  //   scene.fog = new FogExp2("#ffffff", 0.5);
  // }, []);

  // xr.

  // console.log(camera.cameras[]);

  // const portal1 = createPortal(<fogExp2 args={["#5e122a", 0.1]} />, camera[0]);
  // const portal2 = createPortal(<fogExp2 args={["#5e122a", 0.1]} />, camera[1]);

  useFrame((state, delta, frame) => {
    console.log(state.scene.fog);
    if (state.camera.isArrayCamera) {
      console.log("is array camera");
      // const cameras = state.camera as ArrayCamera
      // cameras.cameras[0];
      // console.log("cameras: ", cameras);
      // console.log("camera 0: ", cameras.cameras[0]);
      // console.log("camera 1: ", cameras.cameras[1]);
    } else {
      console.log("is not array camera");
    }
  });

  // return createPortal(<fogExp2 args={["#5e122a", 0.1]} />, camera);

  return (
    <>
      <fog args={["#cccccc", 0.1, 5]} />
    </>
  );
}

export default GameFog;
