import React, { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

function FogParticles() {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 100; i++) {
      // Adjust the number of particles based on performance
      const x = Math.random() * 3 * (Math.random() > 0.5 ? 1 : -1); // Adjust size and distribution
      const y = Math.random() * 3 * (Math.random() > 0.5 ? 1 : -1);
      const z = Math.random() * 3 * (Math.random() > 0.5 ? 1 : -1);
      temp.push(
        <mesh key={i} position={new Vector3(x, y, z)}>
          <sphereGeometry args={[0.01, 20, 20]} />{" "}
          {/* Adjust the size of particles */}
          <meshBasicMaterial opacity={0.1} color="#ffffff" />{" "}
          {/* Adjust opacity and color */}
        </mesh>,
      );
    }
    return temp;
  }, []);

  //   useFrame(({ camera }) => {
  //     particles.forEach((particle, idx) => {
  //       // Here you can add some movement to the particles if needed
  //     });
  //   });

  return <>{particles}</>;
}

export default FogParticles;
