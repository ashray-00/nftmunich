import type { Metadata } from "next";
import RegistrationInterest from "../../components/RegistrationInterest";

export const metadata: Metadata = {
  title: "Registration | NFT Munich e.V.",
  description: "Request the NFT Munich e.V. registration link.",
};

export default function RegistrationRequestPage() {
  return <RegistrationInterest />;
}
