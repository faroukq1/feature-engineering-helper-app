import { Atom } from "lucide-react";

import { LoginForm } from "@/components/login-form";
import FeatureEngineeringTyping from "@/components/FeatureEngineeringTyping";
import { ToggleModeButton } from "@/components/ToggleModeButton";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Atom className="size-4" />
            </div>
            Feature Engineering Helper App
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative bg-muted hidden lg:block">
        <div className="absolute top-5 right-5 z-10">
          <ToggleModeButton />
        </div>
        <FeatureEngineeringTyping />
      </div>
    </div>
  );
}
