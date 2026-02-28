import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AUTHORIZED Security Workflow Studio",
  description: "Ownership-verified security workflow planning and posture checks"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
