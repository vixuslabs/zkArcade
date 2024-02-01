"use client";

import React, { useMemo, useRef } from "react";
import useTrackControllers from "@/lib/hooks/useTrackControllers";
import { TrackedMesh } from "@coconut-xr/natuerlich/react";
import type { ExtendedXRMesh } from "@coconut-xr/natuerlich/react";
import { useFrame } from "@react-three/fiber";
import { Object3D, Quaternion, Vector3 } from "three";
import type { Mesh } from "three";

/**
 *
 * @param mesh - The global mesh which we will be using to create the dark room + flashlight effect
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
        vertexShader={`varying vec3 vPosition;
        varying vec3 vWorldPosition;
            
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        }`}
        fragmentShader={`uniform vec3 flashlightPosition;
        uniform vec3 flashlightDirection;
        uniform float circleRadius;
        
        varying vec3 vWorldPosition; 
        
        void main() {
          vec3 toFragment = vWorldPosition - flashlightPosition;
        
        
          float distanceAlongRay = dot(toFragment, flashlightDirection);
        
          // make sure the flashlight effect only works in front
          if (distanceAlongRay < 0.0) {
            gl_FragColor = vec4(vec3(0.0), 0.985); 
            return;
          }
        
          vec3 onRay = flashlightPosition + flashlightDirection * distanceAlongRay;
          float circleDistance = length(onRay - vWorldPosition);
        
          if (circleDistance >= circleRadius) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.985); 
          } else {
            discard; 
          }
        }`}
        transparent
      />
    </TrackedMesh>
  );
}

export default RoomShadow;
