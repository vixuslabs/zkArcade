import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Vector3 } from "three";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateProximity(
  playerPosition: Vector3,
  objectPosition: Vector3,
  maxDistance: number,
): number {
  // Calculate the Euclidean distance between the player and the object
  const distance = playerPosition.distanceTo(objectPosition);

  // Invert the distance to get a proximity measure (close is high, far is low)
  // If the distance is greater than the maxDistance, the proximity is set to 0.
  const proximity = Math.max(0, (maxDistance - distance) / maxDistance);

  return proximity;
}
