"use client";

import React, { useRef, useMemo } from "react";
import { TrackedMesh } from "@coconut-xr/natuerlich/react";
import { Vector3, Object3D, Quaternion } from "three";

// @ts-expect-error - will fix type error later
import vertex from "@/lib/shaders/roomShadow/vertex.glsl";
// @ts-expect-error - will fix type error later
import fragment from "@/lib/shaders/roomShadow/fragment.glsl";

import type { ExtendedXRMesh } from "@coconut-xr/natuerlich/react";
import type { Mesh } from "three";
import useTrackControllers from "@/lib/hooks/useTrackControllers";
import { useFrame } from "@react-three/fiber";

/**
 *
 * @param mesh - The global mesh which we will be using to create the dark room
 * @returns
 */
function RoomShadow({ mesh }: { mesh: ExtendedXRMesh }) {
  const ref = useRef<Mesh>(null);
  // eslint-disable-next-line
  const [leftController, rightController] = useTrackControllers();
  const flashlight = useRef(new Object3D()).current;
  const worldPosition = useRef(new Vector3());
  const worldQuaternion = useRef(new Quaternion());
  const worldScale = useRef(new Vector3());

  const shaderUniforms = useMemo(
    () => ({
      flashlightPosition: { value: new Vector3() },
      flashlightDirection: { value: new Vector3() },
      circleRadius: { value: 0.35 },
    }),
    [],
  );

  useFrame(() => {
    if (rightController && ref.current) {
      shaderUniforms.flashlightPosition.value.copy(rightController.position);

      flashlight.position.copy(rightController.position);
      flashlight.quaternion.copy(rightController.orientation);

      flashlight.updateWorldMatrix(true, false);

      flashlight.matrixWorld.decompose(
        worldPosition.current,
        worldQuaternion.current,
        worldScale.current,
      );

      shaderUniforms.flashlightPosition.value.copy(worldPosition.current);
      shaderUniforms.flashlightDirection.value
        .set(0, -0.8, -1)
        .applyQuaternion(worldQuaternion.current)
        .normalize();
    }
  });

  return (
    <TrackedMesh ref={ref} mesh={mesh}>
      <shaderMaterial
        uniforms={shaderUniforms}
        vertexShader={vertex as string}
        fragmentShader={fragment as string}
        transparent
      />
    </TrackedMesh>
  );
}

export default RoomShadow;
