import { Separator } from "~/components/ui/separator"
import { ProfileForm } from "./novicke_form"

export default function SettingsProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Novicke</h3>
                <p className="text-sm text-muted-foreground">
                    Uredi objavljene novičke in osnutke
                </p>
            </div>
            <Separator />
            <ProfileForm />
        </div>
    )
}