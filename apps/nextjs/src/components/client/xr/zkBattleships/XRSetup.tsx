"use client";

import React, { useState } from "react";
import { XRCanvas } from "@coconut-xr/natuerlich/defaults";
import {
  ImmersiveSessionOrigin,
  useInputSources,
  useEnterXR,
  useSessionSupported,
  useSessionChange,
  FocusStateGuard,
  useTrackedMeshes,
  useTrackedPlanes,
} from "@coconut-xr/natuerlich/react";
import { getInputSourceId } from "@coconut-xr/natuerlich";
import { SandboxControllers } from "@/components/client/xr/inputDevices";
import { Button } from "@/components/ui/button";

// import { Board } from "./Board";
// import { Carrier } from "./Carrier";
import {
  XRPhysics,
  TrueHand,
  // BuildPhysicalMeshes,
  // BuildPhysicalPlanes,
} from "@vixuslabs/newtonxr";
import XRStage from "./XRStage";
import { ControllerStateProvider } from "../../providers";

import { RapierMeshes, RapierPlanes } from "@/components/client/xr/rapier";

const sessionOptions: XRSessionInit = {
  requiredFeatures: [
    "local-floor",
    "hand-tracking",
    "mesh-detection",
    "plane-detection",
  ],
  // optionalFeatures: ["mesh-detection", "plane-detection"],
};

export function XRSetup() {
  const [startSync, setStartSync] = useState(false);

  const inputSources = useInputSources();
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  const meshes = useTrackedMeshes();
  const planes = useTrackedPlanes();

  const isSupported = useSessionSupported("immersive-ar");

  useSessionChange((curSession, prevSession) => {
    if (prevSession && !curSession) {
      console.log("session ended");
      setStartSync(false);
    }
  }, []);

  return (
    <>
      <div className="absolute z-10 flex flex-col items-center justify-center gap-y-2">
        <h2 className="relative text-center text-2xl font-bold">
          zkBattleships dev
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
            });
          }}
        >
          {isSupported ? "Launch" : "Go on Quest"}
        </Button>
      </div>
      (
      <XRCanvas className="relative" dpr={1}>
        <ambientLight intensity={0.5} />

        <FocusStateGuard>
          <ControllerStateProvider>
            <XRPhysics debug gravity={[0, 0, 0]}>
              {startSync && <XRStage />}

              <RapierMeshes meshes={meshes} />
              <RapierPlanes planes={planes} />

              {/* <BuildPhysicalMeshes />
              <BuildPhysicalPlanes /> */}

              <ImmersiveSessionOrigin>
                {inputSources?.map((inputSource) =>
                  inputSource.hand ? (
                    <TrueHand
                      key={getInputSourceId(inputSource)}
                      inputSource={inputSource}
                      id={getInputSourceId(inputSource)}
                      XRHand={inputSource.hand}
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
      )
    </>
  );
}
