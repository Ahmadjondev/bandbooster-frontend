import { DashboardLayout } from '@/components/layout/dashboard';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
