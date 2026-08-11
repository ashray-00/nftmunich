import type { Metadata } from "next";
import MembershipRegistration from "../../components/MembershipRegistration";

export const metadata: Metadata = {
  title: "Registration | NFT Munich e.V.",
  description: "Apply for membership or complete an approved player registration with NFT Munich e.V.",
};

export default function RegistrationPage() {
  return <MembershipRegistration />;
}
