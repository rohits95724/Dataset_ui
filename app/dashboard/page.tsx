import DashboardHOC from "@/components/screens/dashboard/DashboardHOC";

export const metadata = {
  title: "Dashboard | AeroData Analytics",
  description: "View and filter parsed Excel spreadsheet rows dynamically.",
};

export default function DashboardPage() {
  return <DashboardHOC />;
}
