import { GameCarousel } from "@/components/client/dashboard";

function PrimaryContent() {
  return (
    <div className="gapy-y-2 flex h-full w-full flex-grow flex-col items-center justify-around">
      <GameCarousel />
    </div>
  );
}

export default PrimaryContent;
