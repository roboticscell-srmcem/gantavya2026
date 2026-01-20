import type { Metadata } from "next";
import { Space_Mono, Inter, Bricolage_Grotesque, Poppins } from "next/font/google";
import LayoutWrapper from "@/components/layout/layout-wrapper";
import RazorpayScript from "@/components/razorpay-script";
import "./globals.css";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Gantavya - Robotics & Tech Events",
  icons: {
    icon: "/logo.svg",
  },
  description: "Join Gantavya for cutting-edge robotics competitions, tech talks, and innovation challenges. Experience the future of technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceMono.variable} ${inter.variable} ${bricolage.variable} ${poppins.variable} font-poppins antialiased overflow-x-hidden`}
      >
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <RazorpayScript />
      </body>
    </html>
  );
}
