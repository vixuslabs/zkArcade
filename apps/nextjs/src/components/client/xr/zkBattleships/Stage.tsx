"use client";

import { useEffect, useMemo } from "react";
// import dynamic from "next/dynamic";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

// import { Int64 } from "o1js";

// import { Vector3 } from "@zkarcade/mina/src/structs";

// const Vector3 = dynamic(() => import("@zkarcade/mina/src/structs"));

import { Battleships } from "./zkBattleship";

export function Stage() {
  // const x = useMemo(() => {
  //   return Real64.from(1);
  // }, []);

  useEffect(() => {
    void (async () => {
      const { Vector3, Real64 } = await import("@zkarcade/mina/src/structs");
      // const { Int64 } = await import("o1js");

      // const test = new Vector3({
      //   x: Int64.from(1),
      //   y: Int64.from(1),
      //   z: Int64.from(1),
      // });

      const test = Real64.from(1);

      console.log(test);
    })();
  }, []);

  // const x = useMemo(() => {
  //   return new Vector3({
  //     x: Int64.from(1),
  //     y: Int64.from(1),
  //     z: Int64.from(1),
  //   });
  // }, []);

  // console.log(x);

  return (
    <Canvas>
      <OrbitControls />

      <Battleships />
    </Canvas>
  );
}
