"use client";

import { useRef, useState, useMemo } from "react";
import { useControllerStateContext } from "@/components/client/providers/ControllerStateProvider";
import { SpotLight, SpotLightShadow } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Object3D } from "three";

function Flashlight() {
  const [flashlight, setFlashlight] = useState(false);
  const { pointers } = useControllerStateContext();
  const lightRef = useRef<Object3D | null>(null);
  const target = useMemo(() => {
    return new Vector3(0, 0, -1);
  }, []);

  useFrame(() => {
    // i want this to point the flashlight in the direction of the controller
    for (const [hand, pointer] of Object.entries(pointers)) {
      console.log(hand);

      console.log("pointer", pointer);

      /**
       * NEED CONTROLLER STATE
       * THEN SET LIGHT TO CONTROLLER STATE. EZ
       *
       */

      if (pointer.controllerState && lightRef.current && hand === "right") {
        const positionW = lightRef.current.getWorldPosition(
          pointer.controllerState?.position,
        );
        const rotation = lightRef.current.getWorldQuaternion(
          pointer.controllerState?.orientation,
        );
        console.log("positionW", positionW);
        console.log("rotation", rotation);
        lightRef.current?.setRotationFromQuaternion(rotation);
        lightRef.current?.lookAt(positionW.add(target));
        lightRef.current.updateWorldMatrix(true, true);
      }
    }
  });

  return (
    <>
      {/* <spotLight
        ref={lightRef}
        intensity={2}
        angle={0}
        penumbra={1}
        attenuation={5}
        anglePower={5}
        castShadow
        // depthBuffer={depthBuffer}
      >
        <spotLightShadow
          distance={0.4} // Distance between the shadow caster and light
          alphaTest={0.5} // Sets the alpha value to be used when running an alpha test. See Material.alphaTest
          scale={1} //  Scale of the shadow caster plane
          width={512} // Width of the shadow map. The higher the more expnsive
          height={512}
        />
      </spotLight> */}
      {/* <directionalLight ref={lightRef} intensity={2} castShadow /> */}

      {/* <primitive object={lightRef.current!} /> */}
    </>
  );
}

export default Flashlight;
