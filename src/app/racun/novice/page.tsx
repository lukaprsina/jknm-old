import { Separator } from "~/components/ui/separator";
import { ProfileForm } from "./novice_form";

export default function SettingsProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Novice</h3>
        <p className="text-sm text-muted-foreground">
          Uredi objavljene novičke in osnutke
        </p>
      </div>
      <Separator />
      <ProfileForm />
    </div>
  );
}
