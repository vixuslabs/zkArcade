"use client";

import ProgressiveFeature from "@/components/landingPage/ProgressiveFeature";
import {
  // GlobeAltIcon,
  HomeIcon,
  // HomeModernIcon,
  KeyIcon,
  LockClosedIcon,
  UserGroupIcon,
  // VideoCameraIcon,
  // VideoCameraSlashIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "All Augmented Reality",
    description:
      "Morbi viverra dui mi arcu sed. Tellus semper adipiscing suspendisse semper morbi. Odio urna massa nunc massa.",
    icon: HomeIcon,
  },
  {
    name: "Provably fair games",
    description:
      "Sit quis amet rutrum tellus ullamcorper ultricies libero dolor eget. Sem sodales gravida quam turpis enim lacus amet.",
    icon: KeyIcon,
  },
  {
    name: "Multiplayer games",
    description:
      "Quisque est vel vulputate cursus. Risus proin diam nunc commodo. Lobortis auctor congue commodo diam neque.",
    icon: UserGroupIcon,
  },
  {
    name: "Privacy first",
    description:
      "Arcu egestas dolor vel iaculis in ipsum mauris. Tincidunt mattis aliquet hac quis. Id hac maecenas ac donec pharetra eget.",
    icon: LockClosedIcon,
  },
];

export default function Features() {
  return (
    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
      <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
        {features.map((feature) => (
          <ProgressiveFeature key={feature.name} feature={feature} />
        ))}
      </dl>
    </div>
  );
}
