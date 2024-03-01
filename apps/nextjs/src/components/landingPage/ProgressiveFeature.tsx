"use client";

import type { SVGProps } from "react";
import { useInView } from "react-intersection-observer";

interface ProgressiveFeatureProps {
  feature: {
    name: string;
    description: string;
    icon: React.ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref">>;
  };
}

export default function ProgressiveFeature({
  feature,
}: ProgressiveFeatureProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  return (
    <div
      ref={ref}
      className={`relative pl-16 transition-opacity duration-1000 ${
        inView ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="w-full flex-auto">
        <dt className="text-base font-semibold leading-7">
          <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <feature.icon className="h-6 w-6" aria-hidden="true" />
          </div>
          {feature.name}
        </dt>
        <dd className="mt-2 text-base leading-7 text-secondary-foreground">
          {feature.description}
        </dd>
      </div>
    </div>
  );
}
