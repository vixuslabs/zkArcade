"use client";

import { useEffect, useState } from "react";
import { XRCanvas, Hands, Controllers } from "@coconut-xr/natuerlich/defaults";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  useHeighestAvailableFrameRate,
  useNativeFramebufferScaling,
  useInputSources,
  SpaceGroup,
  useXR,
  useSessionChange,
} from "@coconut-xr/natuerlich/react";
import { clippingEvents } from "@coconut-xr/koestlich";

import { AdjustablePointerController } from "@/components/client/xr/inputDevices";
import { getInputSourceId } from "@coconut-xr/natuerlich";

import Router from "next/router";
import { Button } from "@/components/ui/button";
import { BuildRoom, TestBox, GameFog } from "@/components/client/xr";
import FogParticles from "./FogParticles";

import Lamp from "./Lamp";
import { WebGLRenderer } from "three";

import FogSphere from "./FogSphere";
import { ControllerStateProvider } from "@/components/client/providers";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "mesh-detection", "plane-detection"],
};

// One day :((
// const sessionOptions: XRSessionInit = {
//   requiredFeatures: [
//     "local-floor",
//     "mesh-detection",
//     "plane-detection",
//     "depth-sensing",
//   ],
//   depthSensing: {
//     usagePreference: ["cpu-optimized", "gpu-optimized"],
//     dataFormatPreference: ["luminance-alpha", "float32"],
//   },
// };

type AppUser = {
  id: string;
  username: string;
  firstName: string | null;
  image_url: string;
} | null;

interface RoomCaptureProps {
  user: AppUser;
}

function RoomCapture({ user }: RoomCaptureProps) {
  // function RoomCapture() {
  //   const router = useRouter();
  const [startSync, setStartSync] = useState(false);
  const inputSources = useInputSources();

  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  const enterVR = useEnterXR("immersive-vr", sessionOptions);

  useSessionChange((curSession, prevSession) => {
    console.log("inside useSessionChange");
    console.log("curSession", curSession);
    console.log("prevSession", prevSession);
    if (prevSession && !curSession) {
      console.log("session ended");
      setStartSync(false);
    }
  }, []);

  const frameBufferScaling = useNativeFramebufferScaling();
  const frameRate = useHeighestAvailableFrameRate();

  const handleRoomCapture = async () => {
    setStartSync(true);
    await enterAR();
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-y-2">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Hey {user?.username}! - Capture your room
          {/* Hey - Capture your room */}
        </h2>
        <Button variant="default" onClick={handleRoomCapture}>
          Sync
        </Button>
      </div>
      {startSync && (
        <XRCanvas
          frameBufferScaling={frameBufferScaling}
          frameRate={frameRate}
          // dpr={1}
          dpr={[1, 2]}
          shadows
          // @ts-expect-error - import error
          events={clippingEvents}
          gl={{ localClippingEnabled: true }}
          // onCreated={({ gl }: { gl: WebGLRenderer }) =>
          //   gl.setClearColor("#cccccc")
          // }
        >
          <NonImmersiveCamera />

          {/* Fog and Light */}

          {/* <ambientLight intensity={0.5} color={"#ffffff"} /> */}
          {/* <FogParticles /> */}
          <ambientLight intensity={0.2} />
          {/* <fogExp2 attach="fog" args={["#cccccc", 2]} /> */}
          {/* <GameFog /> */}
          {/* <Lamp position={[0, 5, 0]} /> */}

          <TestBox position={[0, 0, -0.5]} />
          {/* <FogSphere /> */}

          {/* <ImmersiveSessionOrigin position={[0, 0, 0]}> */}
          <ImmersiveSessionOrigin>
            <BuildRoom />
            {/* <FogSphere /> */}

            <TestBox color="black" />
            <ControllerStateProvider>
              {inputSources.map((inputSource: XRInputSource) => (
                <AdjustablePointerController
                  key={getInputSourceId(inputSource)}
                  id={getInputSourceId(inputSource)}
                  inputSource={inputSource}
                />
              ))}
            </ControllerStateProvider>

            {/* <Controllers /> */}
            <Hands />
            {/* <Hands /> */}
          </ImmersiveSessionOrigin>
        </XRCanvas>
      )}
    </>
  );
}

export default RoomCapture;
