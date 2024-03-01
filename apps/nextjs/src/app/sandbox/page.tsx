import { Sandbox } from "@/components/client/xr";
import { BackButton } from "@/components/client/ui/lobby";

function SandboxPage() {
  return (
    <div className="flex items-center justify-center">
      <BackButton />
      <Sandbox />
    </div>
  );
}

export default SandboxPage;
