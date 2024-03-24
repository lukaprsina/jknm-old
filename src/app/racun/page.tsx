import { Separator } from "~/components/ui/separator";
import { ProfileForm } from "./profile_form";

export default function SettingsProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profil</h3>
        <p className="text-sm text-muted-foreground">Nastavitve računa</p>
      </div>
      <Separator />
      <ProfileForm />
    </div>
  );
}
