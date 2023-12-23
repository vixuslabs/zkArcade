"use client";

import { useState } from "react";
import { ControllerStateProvider } from "@/components/client/providers";
import { BuildRoom } from "@/components/client/xr";
import { GameControllers } from "@/components/client/xr/inputDevices";
import GameSphere from "@/components/client/xr/objects/GameSphere";
import { FriendRoom } from "@/components/client/xr/rooms";
import { Button } from "@/components/ui/button";
import type { RoomCaptureProps } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import { clippingEvents } from "@coconut-xr/koestlich";
import { getInputSourceId } from "@coconut-xr/natuerlich";
import {
  Hands,
  TeleportController,
  XRCanvas,
} from "@coconut-xr/natuerlich/defaults";
import {
  ImmersiveSessionOrigin,
  NonImmersiveCamera,
  useEnterXR,
  useHeighestAvailableFrameRate,
  useInputSources,
  useNativeFramebufferScaling,
  useSessionChange,
  useSessionSupported,
} from "@coconut-xr/natuerlich/react";
import { Physics } from "@react-three/rapier";
import { Vector3 } from "three";

// import { useLobbyContext } from "../providers/LobbyProvider";
import MeshesAndPlanesProvider from "../providers/MeshesAndPlanesProvider";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "mesh-detection", "plane-detection"],
};

function HotnColdGame({ user }: RoomCaptureProps) {
  const { players, channel, setXrStarted, gameState, setGameState } =
    useLobbyContext();

  // teleport not working right now
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [teleportLocation, setTeleportLocation] = useState<Vector3>(
    new Vector3(0, 0, 0),
  );

  const [startSync, setStartSync] = useState(false);
  const inputSources = useInputSources();
  const clerkUser = useUser();

  const enterAR = useEnterXR("immersive-ar", sessionOptions);

  const isSupported = useSessionSupported("immersive-ar");
  useSessionChange((curSession, prevSession) => {
    if (prevSession && !curSession) {
      console.log("session ended");
      setStartSync(false);
      setXrStarted(false);
    }
  }, []);

  const frameBufferScaling = useNativeFramebufferScaling();
  const frameRate = useHeighestAvailableFrameRate();

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

            {gameState && gameState.me.isSeeking ? (
              <ambientLight intensity={0} />
            ) : (
              <ambientLight intensity={0.5} />
            )}

            {gameState && gameState.isGameStarted && gameState.me.isHiding && (
              <GameSphere inGame position={[0, 2, -0.3]} />
            )}

            {gameState &&
              gameState.isGameStarted &&
              gameState.oppObject?.objectPosition &&
              gameState.me.isSeeking && (
                <GameSphere
                  inGame
                  name={"hiddenObject"}
                  color="yellow"
                  // @ts-expect-error - this works i swear
                  position={gameState.oppObject?.objectPosition}
                />
              )}

            <ImmersiveSessionOrigin>
              {startSync && (
                <>
                  <MeshesAndPlanesProvider>
                    {/* {gameState && !gameState.me.isHiding && (
                      <BuildRoom inGame={true} />
                    )} */}

                    {gameState && gameState.me.isHiding ? (
                      <FriendRoom />
                    ) : (
                      <BuildRoom inGame={true} />
                    )}
                    {/* {gameState &&
                      gameState.isGameStarted &&
                      gameState.me.isHiding && <FriendRoom />} */}
                  </MeshesAndPlanesProvider>
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
                        <GameControllers
                          key={getInputSourceId(inputSource)}
                          id={getInputSourceId(inputSource)}
                          inputSource={inputSource}
                        />
                      );
                  })
                : inputSources.map((inputSource: XRInputSource) => (
                    <GameControllers
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
