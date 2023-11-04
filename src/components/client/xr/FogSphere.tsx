"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useInputSources, useXR } from "@coconut-xr/natuerlich/react";
import { useState, useRef, useEffect } from "react";
import type { Mesh, ShaderMaterial } from "three";
import { Vector3, ArrayCamera, BackSide } from "three";

// @ts-expect-error - no types for vertext shader import
import vertex from "@/lib/shaders/simFog/vertex.glsl";
// @ts-expect-error - no types for fragment shader import
import fragment from "@/lib/shaders/simFog/fragment.glsl";

function FogSphere() {
  const sphereRef = useRef<THREE.Mesh>(null!);

  const uniforms = {
    userPosition: { value: new Vector3() },
    radiusTransparent: { value: 0.25 },
    radiusOpaque: { value: 0.5 },
  };

  useFrame((state) => {
    if (state.camera instanceof ArrayCamera) {
      const cameraWorldPosition = state.camera.getWorldPosition(
        state.camera.position,
      );
      sphereRef.current.position.copy(cameraWorldPosition);
      uniforms.userPosition.value.copy(cameraWorldPosition);
    }
  });

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <shaderMaterial
        transparent
        side={BackSide}
        uniforms={uniforms}
        vertexShader={vertex as string}
        fragmentShader={fragment as string}
        uniformsNeedUpdate={true}
      />
    </mesh>
  );
}

export default FogSphere;
