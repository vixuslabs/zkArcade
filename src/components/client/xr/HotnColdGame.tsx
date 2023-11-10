"use client";

import { useEffect, useState } from "react";
import {
  XRCanvas,
  Hands,
  TeleportController,
} from "@coconut-xr/natuerlich/defaults";
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
import { useLobbyContext } from "../providers/LobbyProvider";
import MeshesAndPlanesProvider from "../providers/MeshesAndPlanesProvider";
import { useUser } from "@clerk/nextjs";
import FriendRoom from "./FriendRoom";
import { Vector3 } from "three";

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

function HotnColdGame({ user }: RoomCaptureProps) {
  const { players, channel, setXrStarted, gameState, setGameState, started } =
    useLobbyContext();

  const [teleportLocation, setTeleportLocation] = useState<Vector3>(
    new Vector3(0, 0, 0),
  );

  const [startSync, setStartSync] = useState(false);
  const inputSources = useInputSources();
  const clerkUser = useUser();

  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  // const enterVR = useEnterXR("immersive-vr", sessionOptions);

  useSessionChange((curSession, prevSession) => {
    if (prevSession && !curSession) {
      console.log("session ended");
      setStartSync(false);
      setXrStarted(false);
    }
  }, []);

  const isSupported = useSessionSupported("immersive-ar");
  const frameBufferScaling = useNativeFramebufferScaling();
  const frameRate = useHeighestAvailableFrameRate();

  console.log("objectPosition", gameState?.oppObject?.objectPosition);

  return (
    <>
      <div className="absolute z-10 flex flex-col items-center justify-center gap-y-2">
        <h2 className="relative text-center text-2xl font-bold">
          Hey {user?.username} - Press below to launch WebXR!
        </h2>
        <Button
          disabled={!isSupported}
          className="relative"
          variant="default"
          onClick={() => {
            console.log("clicked!");
            void enterAR().then(() => {
              console.log("entered");
              setStartSync(true);
              setXrStarted(true);
              setGameState((prev) => {
                if (!prev) {
                  return prev;
                }

                return {
                  ...prev,
                  me: {
                    isHiding: false,
                    isSeeking: false,
                    isIdle: true,
                  },
                };
              });

              const mePlayer = players.find(
                (p) => p.username === clerkUser.user?.username,
              );

              channel?.trigger("client-game-joined", {
                data: mePlayer,
              });
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
          {/* {startSync && ( */}
          <Physics
            colliders={false}
            gravity={[0, -5, 0]}
            interpolate={false}
            timeStep={"vary"}
            // debug
          >
            <NonImmersiveCamera />

            <ambientLight intensity={0.5} />

            {/* <Lamp position={[0, 7, 0]} /> */}
            {/* <ambientLight color={"#ffffff"} intensity={1} /> */}
            {startSync && (
              <>
                <TestBox position={[0, 0, -0.5]} />
                {/* <TestSphere position={[0, 2, -0.3]} /> */}
              </>
            )}

            {gameState && gameState.isGameStarted && gameState.me.isHiding && (
              <TestSphere position={[0, 2, -0.3]} />
            )}

            {gameState &&
              gameState.isGameStarted &&
              gameState.oppObject?.objectPosition &&
              gameState.me.isSeeking && (
                <TestSphere
                  name={"hiddenObject"}
                  color="yellow"
                  // @ts-expect-error - this works i swear
                  position={gameState.oppObject?.objectPosition}
                  // matrix={gameState.oppObject?.objectMatrix}
                />
              )}

            {/* <ImmersiveSessionOrigin position={[0, 0, 0]}> */}
            <ImmersiveSessionOrigin
            // position={
            // gameState && gameState?.me.isHiding
            // ? teleportLocation
            // : new Vector3(0, 0, 0)
            // teleportLocation
            // }
            >
              {/* {startSync && <BuildRoom />} */}
              {/* <FogSphere /> */}
              {startSync && (
                <>
                  <MeshesAndPlanesProvider>
                    {gameState &&
                      (gameState.me.isSeeking || gameState.me.isIdle) && (
                        <BuildRoom />
                      )}
                    {gameState &&
                      gameState.isGameStarted &&
                      gameState.me.isHiding && <FriendRoom />}
                  </MeshesAndPlanesProvider>
                  <TestBox color="black" />
                </>
              )}
              {gameState && gameState.me.isHiding
                ? inputSources.map((inputSource: XRInputSource) => {
                    if (inputSource.handedness === "left") {
                      return (
                        <TeleportController
                          onTeleport={setTeleportLocation}
                          key={getInputSourceId(inputSource)}
                          id={getInputSourceId(inputSource)}
                          inputSource={inputSource}
                        />
                      );
                    } else
                      return (
                        <AdjustablePointerController
                          key={getInputSourceId(inputSource)}
                          id={getInputSourceId(inputSource)}
                          inputSource={inputSource}
                        />
                      );
                  })
                : inputSources.map((inputSource: XRInputSource) => (
                    <AdjustablePointerController
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

export default HotnColdGame;
