"use client";

import { useState } from "react";
import { XRCanvas, Hands } from "@coconut-xr/natuerlich/defaults";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  useHeighestAvailableFrameRate,
  useNativeFramebufferScaling,
  useInputSources,
  useSessionChange,
  useSessionSupported,
} from "@coconut-xr/natuerlich/react";
import { clippingEvents } from "@coconut-xr/koestlich";
import { SandboxControllers } from "@/components/client/xr/inputDevices";
import { getInputSourceId } from "@coconut-xr/natuerlich";
import { Button } from "@/components/ui/button";
import { BuildRoom, TestBox } from "@/components/client/xr";
import { ControllerStateProvider } from "@/components/client/providers";
import GameSphere from "./objects/GameSphere";
import { Physics } from "@react-three/rapier";

import type { RoomCaptureProps } from "@/lib/types";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "mesh-detection", "plane-detection"],
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
        // @ts-expect-error - import error
        events={clippingEvents}
        gl={{ localClippingEnabled: true }}
      >
        <ControllerStateProvider>
          <Physics
            colliders={false}
            gravity={[0, -5, 0]}
            interpolate={false}
            timeStep={"vary"}
          >
            <NonImmersiveCamera />

            {startSync && (
              <>
                <TestBox position={[0, 0, -0.5]} />
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
                </>
              )}

              {inputSources.map((inputSource: XRInputSource) => (
                <SandboxControllers
                  key={getInputSourceId(inputSource)}
                  id={getInputSourceId(inputSource)}
                  inputSource={inputSource}
                />
              ))}

              <Hands />
            </ImmersiveSessionOrigin>
          </Physics>
        </ControllerStateProvider>
      </XRCanvas>
    </>
  );
}

export default Sandbox;
