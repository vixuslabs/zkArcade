import { GameOverview } from "@/components/dashboard";

function SecondaryContent() {
  return (
    <div className="flex h-full w-full flex-grow flex-col items-center justify-around gap-y-2">
      <GameOverview />
    </div>
  );
}

export default SecondaryContent;
