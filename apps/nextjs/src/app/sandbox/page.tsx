import { BackButton } from "@/components/lobby";
import { Sandbox } from "@/components/xr";

function SandboxPage() {
  return (
    <div className="flex items-center justify-center">
      <BackButton />
      <Sandbox />
    </div>
  );
}

export default SandboxPage;
