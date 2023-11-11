"use client";

import {
  useRef,
  useState,
  useEffect,
  Suspense,
  useMemo,
  useCallback,
} from "react";
import { Vector2, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { XCurvedPointer } from "@coconut-xr/xinteraction/react";
import { RayBasicMaterial } from "@coconut-xr/natuerlich/defaults";
import {
  useInputSourceEvent,
  SpaceGroup,
  DynamicControllerModel,
  ButtonState,
  useXRGamepadReader,
} from "@coconut-xr/natuerlich/react";

import { useControllerStateContext } from "@/components/client/providers/ControllerStateProvider";
import type { XLinesIntersection } from "@coconut-xr/xinteraction";
import type { TriggerState } from "@/lib/types";
import type { InputDeviceFunctions } from "@coconut-xr/xinteraction/react";
import type { Group } from "three";
import { useLobbyContext } from "../../providers/LobbyProvider";

const rayMaterial = new RayBasicMaterial({
  transparent: true,
  toneMapped: false,
});

const INITIAL_POINT = new Vector3(0, 0, 0);
const INITIAL_RAY_LENGTH = 0.01;
const RAY_ADJUSTMENT_SPEED = 0.6;

function GameControllers({
  inputSource,
  id,
}: {
  inputSource: XRInputSource;
  id: number;
}) {
  const pointerRef = useRef<InputDeviceFunctions>(null);
  const [rayLength, setRayLength] = useState<number>(INITIAL_RAY_LENGTH);
  const [heldObject, setHeldObject] = useState<{
    uuid: string;
    name?: string;
  } | null>(null);
  const controllerRef = useRef<Group>(null);
  const { gameState } = useLobbyContext();
  const { pointers, setLeftPointer, setRightPointer } =
    useControllerStateContext();

  const pointerPoints = useMemo(
    () => [INITIAL_POINT, new Vector3(0, 0, -rayLength)],
    [rayLength],
  );
  const rayOffset = useMemo(() => rayLength * 0.5, [rayLength]);
  const [sendingPosition, setSendingPosition] = useState(false);

  const controllerReader = useXRGamepadReader(inputSource);

  const thumbstick = useRef<Vector2>(new Vector2());

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (gameState && gameState.me.isSeeking && !sendingPosition) {
      interval = setInterval(() => {
        const pos = controllerRef.current?.getWorldPosition(
          controllerRef.current.position,
        );

        inputSource.gamepad?.hapticActuators.forEach((haptic) => {
          void haptic.playEffect("dual-rumble", {
            duration: 100,
            strongMagnitude: 0.5,
            weakMagnitude: 0.5,
          });
        });
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameState]);

  const updatePointerState = useCallback(
    (
      isRight: boolean,
      zValue: number,
      stateValue: TriggerState,
      heldObject: { uuid: string; name?: string } | null,
    ) => {
      const newState = {
        z: zValue,
        state: stateValue,
        heldObject: heldObject,
        controllerPosition: controllerRef.current?.position ?? null,
      };
      isRight ? setRightPointer(newState) : setLeftPointer(newState);
    },
    [setLeftPointer, setRightPointer],
  );

  useFrame((state, delta) => {
    let newRayLength = rayLength;

    const adjustment = RAY_ADJUSTMENT_SPEED * delta;

    controllerReader.readAxes("xr-standard-thumbstick", thumbstick.current);

    if (thumbstick.current.y < -0.2) {
      newRayLength += adjustment;
    } else if (thumbstick.current.y > 0.2 && rayLength > INITIAL_RAY_LENGTH) {
      newRayLength -= adjustment;
    }

    if (newRayLength !== rayLength) {
      setRayLength(newRayLength);
    }
  });

  const handleSelectStart = useCallback(
    (e: XRInputSourceEvent) => {
      e.inputSource.gamepad?.hapticActuators.forEach((haptic) => {
        void haptic.playEffect("dual-rumble", {
          duration: 100,
          strongMagnitude: 0.5,
          weakMagnitude: 0.5,
        });
      });
      updatePointerState(
        inputSource.handedness === "right",
        -rayLength,
        ButtonState.PRESSED,
        heldObject,
      );
      pointerRef.current?.press(0, e);
    },
    [rayLength, heldObject, updatePointerState],
  );

  const handleSelectEnd = useCallback(
    (e: XRInputSourceEvent) => {
      updatePointerState(
        inputSource.handedness === "right",
        -rayLength,
        ButtonState.DEFAULT,
        heldObject,
      );
      pointerRef.current?.release(0, e);
    },
    [rayLength, heldObject, updatePointerState],
  );

  useInputSourceEvent("selectstart", inputSource, handleSelectStart, [
    rayLength,
  ]);

  useInputSourceEvent("selectend", inputSource, handleSelectEnd, [rayLength]);

  const handleIntersection = (intersection: readonly XLinesIntersection[]) => {
    const isRight = inputSource.handedness === "right";

    if (!intersection.length || !intersection[0]?.capturedObject) {
      const activeHeldObject = isRight
        ? pointers.right.heldObject
        : pointers.left.heldObject;

      if (!activeHeldObject) return;

      updatePointerState(
        isRight,
        -rayLength,
        isRight ? pointers.right.state : pointers.left.state,
        null,
      );

      setHeldObject(null);
      return;
    }
    const activePointer = isRight ? pointers.right : pointers.left;
    const capturedObject = intersection[0]?.capturedObject;

    if (
      !activePointer.heldObject ||
      capturedObject.uuid !== activePointer.heldObject.uuid
    ) {
      console.log(`setting held object: `, capturedObject);
      setHeldObject({
        uuid: capturedObject.uuid,
        name: capturedObject.name || undefined,
      });
    }
  };

  useEffect(() => {
    inputSource.handedness == "right"
      ? setRightPointer({
          z: -rayLength,
          state: pointers.right.state,
          heldObject,
        })
      : setLeftPointer({
          z: -rayLength,
          state: pointers.left.state,
          heldObject,
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rayLength, heldObject]);

  useEffect(() => {
    inputSource.handedness === "right"
      ? setRightPointer({
          z: -rayLength,
          state: ButtonState.DEFAULT,
          heldObject,
        })
      : setLeftPointer({
          z: -rayLength,
          state: ButtonState.DEFAULT,
          heldObject,
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {inputSource.gripSpace && (
        <SpaceGroup ref={controllerRef} space={inputSource.gripSpace}>
          <Suspense fallback={null}>
            <DynamicControllerModel inputSource={inputSource} />
          </Suspense>
        </SpaceGroup>
      )}
      <SpaceGroup space={inputSource.targetRaySpace}>
        <XCurvedPointer
          points={pointerPoints}
          ref={pointerRef}
          id={id}
          onIntersections={handleIntersection}
        />
        <mesh
          scale-x={0.005}
          scale-y={0.005}
          scale-z={rayLength}
          position-z={-rayOffset}
          material={rayMaterial}
        >
          <boxGeometry />
        </mesh>
      </SpaceGroup>
    </>
  );
}

export default GameControllers;
