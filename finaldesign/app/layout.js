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
  title: "Robert Network Research | WLT Research & Insights",
  description:
    "Robert Network Research brings WLT research, ecosystem insights, and digital asset education together in one place.",
  icons: {
    icon: "/images/robert-network-research-coin.png",
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
