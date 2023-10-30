"use client";

import { useState } from "react";
import { XRCanvas, Hands, Controllers } from "@coconut-xr/natuerlich/defaults";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  useHeighestAvailableFrameRate,
  useNativeFramebufferScaling,
  useInputSources,
} from "@coconut-xr/natuerlich/react";
import { clippingEvents } from "@coconut-xr/koestlich";

// import { useRouter } from "next/navigation";
import Router from "next/router";
import { Button } from "@/components/ui/button";
import BuildRoom from "./BuildRoom";
import TestBox from "./TestBox";
const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "mesh-detection", "plane-detection"],
};

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
  //   const router = useRouter();

  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  const [startSync, setStartSync] = useState(false);

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
        </h2>
        <Button variant="default" onClick={handleRoomCapture}>
          Sync
        </Button>
      </div>
      {startSync && (
        <XRCanvas
          frameBufferScaling={frameBufferScaling}
          frameRate={frameRate}
          dpr={1}
          events={clippingEvents}
          gl={{ localClippingEnabled: true }}
        >
          <BuildRoom />

          <NonImmersiveCamera />

          <TestBox position={[0, 0, -0.5]} />
          <ImmersiveSessionOrigin position={[0, 0, 0]}>
            <TestBox color="black" />
            <Controllers />
            <Hands />
            {/* <Hands /> */}
          </ImmersiveSessionOrigin>
        </XRCanvas>
      )}
    </>
  );
}

export default RoomCapture;
