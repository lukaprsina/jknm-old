import { permanentRedirect, RedirectType } from "next/navigation";

export default function ProfilePage() {
  permanentRedirect("/nastavitve/profil", RedirectType.replace);
}
