"use client";

import { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, Quaternion } from "three";
import { ButtonState, useInputSources } from "@coconut-xr/natuerlich/react";

import type {
  RightControllerState,
  LeftControllerState,
  useTrackControllersReturn,
  GamepadButtonState,
} from "@/lib/types";

const getButtonState = (button: {
  pressed: boolean;
  touched: boolean;
  value: number;
}): GamepadButtonState => ({
  pressed: button.pressed,
  touched: button.touched,
  value: button.value,
});

interface Controllers {
  leftController: LeftControllerState | null;
  rightController: RightControllerState | null;
}

function useTrackControllers(): useTrackControllersReturn {
  const [controllers, setControllers] = useState<Controllers>({
    leftController: null,
    rightController: null,
  });
  const inputSources = useInputSources();

  const inputSourcesInitialized = Boolean(inputSources.length);

  useFrame((state, delta, frame: XRFrame | undefined) => {
    if (!inputSourcesInitialized || !frame) return;
    const referenceSpace = state.gl.xr.getReferenceSpace();
    if (!referenceSpace) return;

    let newLeftController: LeftControllerState | null = null;
    let newRightController: RightControllerState | null = null;

    for (const inputSource of inputSources) {
      const { handedness, gripSpace, gamepad } = inputSource;

      if (!handedness || !gripSpace || !gamepad) continue;

      const pose = frame.getPose(gripSpace, referenceSpace);
      if (!pose) continue;

      let bottomButtonState: ButtonState | null = null;
      let topButtonState: ButtonState | null = null;

      if (gamepad.connected && gamepad.buttons[4] && gamepad.buttons[5]) {
        bottomButtonState = getButtonState(gamepad.buttons[4]).pressed
          ? ButtonState.PRESSED
          : getButtonState(gamepad.buttons[4]).touched
            ? ButtonState.TOUCHED
            : ButtonState.DEFAULT;

        topButtonState = getButtonState(gamepad.buttons[5]).pressed
          ? ButtonState.PRESSED
          : getButtonState(gamepad.buttons[5]).touched
            ? ButtonState.TOUCHED
            : ButtonState.DEFAULT;
      }

      const { position, orientation } = pose.transform;

      if (position && orientation) {
        if (handedness === "left") {
          newLeftController = {
            visible: true,
            position: new Vector3(position.x, position.y, position.z),
            orientation: new Quaternion(
              orientation.x,
              orientation.y,
              orientation.z,
              orientation.w,
            ),
            gamepad: {
              axes: gamepad.axes,
              buttons: {
                "x-button": bottomButtonState,
                "y-button": topButtonState,
              },
            },
          } as LeftControllerState;
        } else if (handedness === "right") {
          newRightController = {
            visible: true,
            position: new Vector3(position.x, position.y, position.z),
            orientation: new Quaternion(
              orientation.x,
              orientation.y,
              orientation.z,
              orientation.w,
            ),
            gamepad: {
              axes: gamepad.axes,
              buttons: {
                "a-button": bottomButtonState,
                "b-button": topButtonState,
              },
            },
          } as RightControllerState;
        }
      }
    }
    if (
      newLeftController !== controllers.leftController ||
      newRightController !== controllers.rightController
    ) {
      setControllers({
        leftController: newLeftController,
        rightController: newRightController,
      });
    }
  });

  return [controllers.leftController, controllers.rightController];
}

export default useTrackControllers;
