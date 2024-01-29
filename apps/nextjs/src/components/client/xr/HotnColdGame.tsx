"use client";

import { useState } from "react";
import { ControllerStateProvider } from "@/components/client/providers";
import { BuildRoom } from "@/components/client/xr";
import { GameControllers } from "@/components/client/xr/inputDevices";
import GameSphere from "@/components/client/xr/objects/GameSphere";
import { FriendRoom } from "@/components/client/xr/rooms";
import { Button } from "@/components/ui/button";
import { useHotnCold } from "@/lib/stores";
// import { useHotnCold, useLobbyStore } from "@/lib/stores";
import { HotnColdGameStatus } from "@/lib/types";
import type { HotnColdEvents } from "@/lib/types";
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
  useSessionSupported,
} from "@coconut-xr/natuerlich/react";
import { XRPhysics } from "@vixuslabs/newtonxr";
import { Vector3 } from "three";
import { useShallow } from "zustand/react/shallow";

import MeshesAndPlanesProvider from "../providers/MeshesAndPlanesProvider";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "mesh-detection", "plane-detection"],
  optionalFeatures: ["hand-tracking"],
};

function HotnColdGame({
  // launchXR,
  gameEventsInitialized, // xrSupported, // setXRSupported,
}: {
  // launchXR: boolean;
  gameEventsInitialized: boolean;
  // xrSupported: boolean;
  // setXRSupported: (isXRSupported: boolean) => void;
}) {
  // const hotNColdStore = useHotnCold();

  const getGameChannel = useHotnCold(
    useShallow((state) => state.getGameChannel),
  );

  const setGameStatus = useHotnCold(useShallow((state) => state.setGameStatus));

  // const hotnColdStore = useHotnCold();

  const { me, setMe, opponent, status, startRoomSync } = useHotnCold();

  // teleport not working right now
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [teleportLocation, setTeleportLocation] = useState<Vector3>(
    new Vector3(0, 0, 0),
  );

  const inputSources = useInputSources();

  const enterAR = useEnterXR("immersive-ar", sessionOptions);

  const isSupported = useSessionSupported("immersive-ar");

  const frameBufferScaling = useNativeFramebufferScaling();
  const frameRate = useHeighestAvailableFrameRate();

  // if (!isSupported) {
  //   return null;
  // }

  if (!me || !opponent) {
    return null;
  }

  return (
    <>
      <div className="relative z-30 mt-4 flex items-center justify-center">
        <Button
          variant={"default"}
          onClick={() => {
            console.log("clicked!");
            void enterAR().then(() => {
              console.log("entered");

              const channel = getGameChannel();

              const { opponent } = useHotnCold.getState();

              channel.trigger("client-in-game" as HotnColdEvents, {
                inGame: true,
              });

              setMe({ ...me, inGame: true });

              if (!opponent) {
                throw new Error("void enterAR().then: no opponent");
              }

              console.log("void enterAR().then: opponent", opponent);

              console.log("void enterAR().then: me", me);

              if (opponent.inGame) {
                console.log(
                  "void enterAR().then: opponent in game, setting status to SEEKING",
                );
                setGameStatus(HotnColdGameStatus.LOADINGROOMS);
              } else {
                console.log(
                  "void enterAR().then: opponent not in game, setting status to IDLE",
                );
                setGameStatus(HotnColdGameStatus.IDLE);
              }

              // setStartSync(true);
            });
          }}
          disabled={!isSupported || !gameEventsInitialized}
        >
          {!isSupported ? "XR Not Supported" : "Launch XR"}
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
          <XRPhysics
            colliders={false}
            gravity={[0, 0, 0]}
            interpolate={false}
            timeStep={"vary"}
            debug
          >
            <NonImmersiveCamera />

            {status === HotnColdGameStatus.SEEKING ? (
              <ambientLight intensity={0} />
            ) : (
              <ambientLight intensity={0.5} />
            )}

            {me.hiding && <GameSphere inGame position={[0, 1, -0.3]} />}

            {status === HotnColdGameStatus.SEEKING &&
              opponent.objectPosition && (
                <GameSphere
                  inGame
                  name={"hiddenObject"}
                  color="yellow"
                  // @ts-expect-error - this works i swear
                  position={opponent.objectPosition}
                />
              )}

            {me.hiding && <FriendRoom />}

            <ImmersiveSessionOrigin>
              <MeshesAndPlanesProvider>
                {/* {gameState && !gameState.me.isHiding && (
                      <BuildRoom inGame={true} />
                    )} */}

                {/* {status === HotnColdGameStatus.IDLE && (
                    <BuildRoom inGame={true} />
                  )} */}

                {status === HotnColdGameStatus.SEEKING && (
                  <BuildRoom inGame={true} />
                )}

                {status === HotnColdGameStatus.LOADINGROOMS &&
                  startRoomSync && <BuildRoom syncingRoom inGame={true} />}
              </MeshesAndPlanesProvider>

              {(me.hiding ||
                (me.hidObject && status === HotnColdGameStatus.ONEHIDING)) &&
                inputSources.map((inputSource: XRInputSource) => (
                  <GameControllers
                    key={getInputSourceId(inputSource)}
                    id={getInputSourceId(inputSource)}
                    inputSource={inputSource}
                  />
                ))}

              {/* {me.hidObject &&
                status === HotnColdGameStatus.ONEHIDING &&
                inputSources.map((inputSource: XRInputSource) => (
                  <GameControllers
                    key={getInputSourceId(inputSource)}
                    id={getInputSourceId(inputSource)}
                    inputSource={inputSource}
                  />
                ))} */}

              {me.hidObject &&
                me.seeking &&
                inputSources.map((inputSource: XRInputSource) => {
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
                })}

              {/* // : inputSources.map((inputSource: XRInputSource) => (
                //     <GameControllers
                //       key={getInputSourceId(inputSource)}
                //       id={getInputSourceId(inputSource)}
                //       inputSource={inputSource}
                //     />
                //   ))} */}

              <Hands />
            </ImmersiveSessionOrigin>
          </XRPhysics>
        </ControllerStateProvider>
      </XRCanvas>
    </>
  );
}

export default HotnColdGame;
