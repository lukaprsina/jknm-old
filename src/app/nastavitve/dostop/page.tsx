import { Separator } from "~/components/ui/separator";
import { ProfileForm } from "./access_form";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Dostop</h3>
        <p className="text-sm text-muted-foreground">
          Uredi kdo je urednik in kdo je skrbnik
        </p>
      </div>
      <Separator />
      <ProfileForm />
    </div>
  );
}
