import { GameOverview } from "@/components/client/dashboard";

function SecondaryContent() {
  return (
    <div className="gapy-y-2 flex h-full w-full flex-grow flex-col items-center justify-around">
      <GameOverview />
    </div>
  );
}

export default SecondaryContent;
