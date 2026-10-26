import "./globals.css";
import Script from "next/script";
import { Aldrich } from "next/font/google";

const aldrich = Aldrich({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-aldrich",
  display: "swap",
});

export const metadata = {
  title: "Robotic Networks Research | Robotics & Intelligent Systems",
  description:
    "Robotic Networks Research explores robotics, automation, intelligent systems, and connected technologies through accessible research and insights.",
  icons: {
    icon: "/images/rnr-logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={aldrich.variable}>
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
