"use client";

import { useEffect, useState } from "react";
import { ControllerStateProvider } from "@/components/client/providers";
import { useHotnCold, useLobbyStore } from "@/components/client/stores";
import { BuildRoom } from "@/components/client/xr";
import { GameControllers } from "@/components/client/xr/inputDevices";
import GameSphere from "@/components/client/xr/objects/GameSphere";
import { FriendRoom } from "@/components/client/xr/rooms";
import { HotnColdGameStatus } from "@/lib/types";
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
import { XRPhysics } from "@vixuslabs/newtonxr";
import { Vector3 } from "three";

import MeshesAndPlanesProvider from "../providers/MeshesAndPlanesProvider";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "mesh-detection", "plane-detection"],
};

function HotnColdGame({
  launchXR,
  xrSupported,
  setXRSupported,
}: {
  launchXR: boolean;
  xrSupported: boolean;
  setXRSupported: (isXRSupported: boolean) => void;
}) {
  const hotNColdStore = useHotnCold();
  const lobbyStore = useLobbyStore();

  // teleport not working right now
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [teleportLocation, setTeleportLocation] = useState<Vector3>(
    new Vector3(0, 0, 0),
  );

  const [startSync, setStartSync] = useState(false);
  const inputSources = useInputSources();

  const enterAR = useEnterXR("immersive-ar", sessionOptions);

  const isSupported = useSessionSupported("immersive-ar");

  useSessionChange((curSession, prevSession) => {
    if (prevSession && !curSession) {
      console.log("session ended");
      setStartSync(false);
      // setXrStarted(false);
      const storeMe = hotNColdStore.me;

      if (!storeMe) {
        throw new Error("no storeMe");
      }

      hotNColdStore.setMe({ ...storeMe, inGame: false });
    }

    if (curSession && !prevSession) {
      console.log("session started");
    }
  }, []);

  const frameBufferScaling = useNativeFramebufferScaling();
  const frameRate = useHeighestAvailableFrameRate();

  useEffect(() => {
    if (isSupported && !xrSupported) {
      setXRSupported(true);
    }

    if (!isSupported && xrSupported) {
      setXRSupported(false);
    }
  }, [isSupported, setXRSupported, xrSupported]);

  useEffect(() => {
    if (xrSupported && launchXR) {
      enterAR()
        .then(() => {
          setStartSync(true);
          // setXrStarted(true);
          const storeMe = hotNColdStore.me;

          if (storeMe) {
            console.log("storeMe: ", storeMe);

            hotNColdStore.setMe({ ...storeMe, inGame: true });
          } else {
            const me = lobbyStore.me;

            if (!me) {
              throw new Error("no me in lobby - lobbyStore.me");
            }

            hotNColdStore.setMe({
              ...me,
              inGame: false,
              playerPosition: null,
              playerProximity: null,
              objectMatrix: null,
              objectPosition: null,
              roomLayout: null,
              hiding: false,
              foundObject: false,
            });
          }
        })
        .catch((err) => {
          console.log("error entering AR: ", err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launchXR, xrSupported, enterAR]);

  useEffect(() => {
    if (!hotNColdStore.me) {
      hotNColdStore.updatePlayers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
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
            gravity={[0, -5, 0]}
            interpolate={false}
            timeStep={"vary"}
            // debug
          >
            <NonImmersiveCamera />

            {hotNColdStore.status === HotnColdGameStatus.SEEKING ? (
              <ambientLight intensity={0} />
            ) : (
              <ambientLight intensity={0.5} />
            )}

            {(hotNColdStore.status === HotnColdGameStatus.BOTHHIDING ||
              hotNColdStore.status === HotnColdGameStatus.ONEHIDING) &&
              hotNColdStore.me?.hiding && (
                <GameSphere inGame position={[0, 2, -0.3]} />
              )}

            {hotNColdStore.status === HotnColdGameStatus.SEEKING &&
              hotNColdStore.opponent?.objectPosition && (
                <GameSphere
                  inGame
                  name={"hiddenObject"}
                  color="yellow"
                  // @ts-expect-error - this works i swear
                  position={hotNColdStore.opponent.objectPosition}
                />
              )}

            <ImmersiveSessionOrigin>
              {startSync && (
                <>
                  <MeshesAndPlanesProvider>
                    {/* {gameState && !gameState.me.isHiding && (
                      <BuildRoom inGame={true} />
                    )} */}

                    {hotNColdStore.status === HotnColdGameStatus.BOTHHIDING ||
                    hotNColdStore.status === HotnColdGameStatus.ONEHIDING ? (
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
              {(hotNColdStore.status === HotnColdGameStatus.BOTHHIDING ||
                hotNColdStore.status === HotnColdGameStatus.ONEHIDING) &&
              hotNColdStore.me?.hiding
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
          </XRPhysics>
        </ControllerStateProvider>
      </XRCanvas>
    </>
  );
}

export default HotnColdGame;
