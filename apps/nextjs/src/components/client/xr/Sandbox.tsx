"use client";

import { useState } from "react";
import { ControllerStateProvider } from "@/components/client/providers";
import { BuildRoom } from "@/components/client/xr";
import { SandboxControllers } from "@/components/client/xr/inputDevices";
import { Button } from "@/components/ui/button";
import type { RoomCaptureProps } from "@/lib/types";
// import { clippingEvents } from "@coconut-xr/koestlich";
import { getInputSourceId } from "@coconut-xr/natuerlich";
import { XRCanvas } from "@coconut-xr/natuerlich/defaults";
import {
  FocusStateGuard,
  ImmersiveSessionOrigin,
  NonImmersiveCamera,
  useEnterXR,
  useHeighestAvailableFrameRate,
  useInputSources,
  useNativeFramebufferScaling,
  useSessionChange,
  useSessionSupported,
} from "@coconut-xr/natuerlich/react";
// import { Physics } from "@react-three/rapier";
import {
  BuildPhysicalMeshes,
  BuildPhysicalPlanes,
  PhysHand,
  XRPhysics,
} from "@vixuslabs/newtonxr";

import GameSphere from "./objects/GameSphere";

const sessionOptions: XRSessionInit = {
  requiredFeatures: [
    "local-floor",
    "mesh-detection",
    "plane-detection",
    "hand-tracking",
  ],
};

function Sandbox({ user }: RoomCaptureProps) {
  const [startSync, setStartSync] = useState(false);
  const inputSources = useInputSources();

  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  const isSupported = useSessionSupported("immersive-ar");

  useSessionChange((curSession, prevSession) => {
    if (prevSession && !curSession) {
      console.log("session ended");
      setStartSync(false);
    }
  }, []);

  const frameBufferScaling = useNativeFramebufferScaling();
  const frameRate = useHeighestAvailableFrameRate();

  return (
    <>
      <div className="absolute z-10 flex flex-col items-center justify-center gap-y-2">
        <h2 className="relative text-center text-2xl font-bold">
          Hey {user?.username}! Press below to launch WebXR
        </h2>
        <p className="relative text-center text-2xl font-bold">
          Enjoy this sandbox environment, more to come!
        </p>
        <Button
          disabled={!isSupported}
          className="relative"
          variant="default"
          onClick={() => {
            console.log("clicked!");
            void enterAR().then(() => {
              console.log("entered");
              setStartSync(true);
            });
          }}
        >
          {isSupported ? "Begin" : "Device not Compatible :("}
        </Button>
      </div>

      <XRCanvas
        frameBufferScaling={frameBufferScaling}
        frameRate={frameRate}
        dpr={[1, 2]}
        // // @ts-expect-error - import error
        // events={clippingEvents}
        gl={{ localClippingEnabled: true }}
      >
        <ambientLight intensity={1} />

        <FocusStateGuard>
          <ControllerStateProvider>
            <XRPhysics
              // debug
              // colliders={false}
              gravity={[0, -5, 0]}
              // interpolate={false}
              timeStep={"vary"}
            >
              <NonImmersiveCamera />

              {startSync && (
                <>
                  <GameSphere
                    inGame={false}
                    color="blue"
                    position={[0, 2, -0.3]}
                  />
                  <GameSphere inGame={false} position={[0, 1, -0.3]} />
                </>
              )}

              <ImmersiveSessionOrigin>
                {startSync && (
                  <>
                    <BuildRoom inGame={false} />
                    {/* <BuildPhysicalMeshes excludeGlobalMesh debug />
                    <BuildPhysicalPlanes debug /> */}
                  </>
                )}
                <BuildPhysicalMeshes debug />
                <BuildPhysicalPlanes debug />
                {inputSources?.map((inputSource) =>
                  inputSource.hand ? (
                    <PhysHand
                      key={getInputSourceId(inputSource)}
                      inputSource={inputSource}
                      id={getInputSourceId(inputSource)}
                      hand={inputSource.hand}
                      withDigitalHand
                    />
                  ) : (
                    <SandboxControllers
                      key={getInputSourceId(inputSource)}
                      id={getInputSourceId(inputSource)}
                      inputSource={inputSource}
                    />
                  ),
                )}
              </ImmersiveSessionOrigin>
            </XRPhysics>
          </ControllerStateProvider>
        </FocusStateGuard>
      </XRCanvas>
    </>
  );
}

export default Sandbox;
