// app/layout.tsx
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";

export const metadata = {
  title: "KissanAI",
  description: "Farmer Support App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <NavbarWrapper /> {/* Navbar appears conditionally */}
        {children}
      </body>
    </html>
  );
}
