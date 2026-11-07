import { CreatorTokenWizard } from "./CreatorTokenWizard";

export const metadata = {
  title: "Launch Creator Token — Vela",
  description: "Deploy your SEP-41 creator token in one click",
};

export default function CreatorOnboardingPage() {
  return <CreatorTokenWizard />;
}
