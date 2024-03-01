import { BackButton } from "@/components/client/ui/lobby";
import { Sandbox } from "@/components/client/xr";

function SandboxPage() {
  return (
    <div className="flex items-center justify-center">
      <BackButton />
      <Sandbox />
    </div>
  );
}

export default SandboxPage;
