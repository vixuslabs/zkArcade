"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";

type CanvasProps = React.ComponentProps<typeof Canvas>;

interface ArcadeCanvasProps extends CanvasProps {
  children: React.ReactNode;
}

function ArcadeCanvas({ children, ...props }: ArcadeCanvasProps) {
  return <Canvas {...props}>{children}</Canvas>;
}

export default ArcadeCanvas;
