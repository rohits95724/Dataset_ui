import LoginHOC from "@/components/screens/auth/login/LoginHOC";

export const metadata = {
  title: "Login | AeroData Analytics",
  description: "Sign in to access your AeroData spreadsheet parsing dashboard.",
};

export default function LoginPage() {
  return <LoginHOC />;
}
