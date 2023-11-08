"use client";

import { useEffect, useState } from "react";
import { XRCanvas, Hands } from "@coconut-xr/natuerlich/defaults";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  useHeighestAvailableFrameRate,
  useNativeFramebufferScaling,
  useInputSources,
  useSessionChange,
} from "@coconut-xr/natuerlich/react";
import { clippingEvents } from "@coconut-xr/koestlich";

import { AdjustablePointerController } from "@/components/client/xr/inputDevices";
import { getInputSourceId } from "@coconut-xr/natuerlich";

// import Router from "next/router";
import { Button } from "@/components/ui/button";
import { BuildRoom, TestBox } from "@/components/client/xr";

// import Lamp from "./Lamp";
import { ControllerStateProvider } from "@/components/client/providers";
// import { Flashlight } from "@/components/client/xr/inputDevices";

import TestSphere from "./objects/TestSphere";

import { Physics } from "@react-three/rapier";

const sessionOptions: XRSessionInit = {
  requiredFeatures: [
    "local-floor",
    "mesh-detection",
    "plane-detection",
    // "layers",
    // "depth-sorted-layers",
  ],
  // optionalFeatures: ["light-estimation"],
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
  image_url: string | null;
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
  // const enterVR = useEnterXR("immersive-vr", sessionOptions);

  // useSessionChange((curSession, prevSession) => {
  //   console.log("inside useSessionChange");
  //   console.log("curSession", curSession);
  //   console.log("prevSession", prevSession);
  //   if (prevSession && !curSession) {
  //     console.log("session ended");
  //     setStartSync(false);
  //   }
  // }, []);

  const frameBufferScaling = useNativeFramebufferScaling();
  const frameRate = useHeighestAvailableFrameRate();

  return (
    <>
      <div className="absolute flex flex-col items-center justify-center gap-y-2">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          {/* Hey {user?.username}! - Capture your room */}
          Hey - Capture your room
        </h2>
        <Button
          variant="default"
          onClick={() => {
            void enterAR().then(() => {
              console.log("entered");
              setStartSync(true);
            });
          }}
        >
          Sync
        </Button>
      </div>

      {/* {startSync && ( */}
      <XRCanvas
        frameBufferScaling={frameBufferScaling}
        frameRate={frameRate}
        // dpr={1}
        dpr={[1, 2]}
        // @ts-expect-error - import error
        events={clippingEvents}
        gl={{ localClippingEnabled: true }}
        // onCreated={({ gl }: { gl: WebGLRenderer }) =>
        //   gl.setClearColor("#cccccc")
        // }
      >
        <ControllerStateProvider>
          {/* {startSync && ( */}
          <Physics
            colliders={false}
            gravity={[0, -5, 0]}
            interpolate={false}
            timeStep={"vary"}
            // debug
          >
            <NonImmersiveCamera />

            {/* <Lamp position={[0, 7, 0]} /> */}
            {/* <ambientLight color={"#ffffff"} intensity={1} /> */}
            {startSync && (
              <>
                <TestBox position={[0, 0, -0.5]} />
                <TestSphere position={[0, 2, -0.3]} />
              </>
            )}
            {/* <FogSphere /> */}

            {/* <ImmersiveSessionOrigin position={[0, 0, 0]}> */}
            <ImmersiveSessionOrigin>
              {/* {startSync && <BuildRoom />} */}
              {/* <FogSphere /> */}
              {startSync && (
                <>
                  <BuildRoom />
                  <TestBox color="black" />
                </>
              )}

              {/* <ControllerStateProvider> */}
              {inputSources.map((inputSource: XRInputSource) => (
                <AdjustablePointerController
                  key={getInputSourceId(inputSource)}
                  id={getInputSourceId(inputSource)}
                  inputSource={inputSource}
                />
              ))}
              {/* <Flashlight /> */}
              {/* </ControllerStateProvider> */}

              {/* <Controllers /> */}
              <Hands />
              {/* <Hands /> */}
            </ImmersiveSessionOrigin>
          </Physics>
          {/* )} */}
        </ControllerStateProvider>
      </XRCanvas>
      {/* )} */}
    </>
  );
}

export default RoomCapture;
