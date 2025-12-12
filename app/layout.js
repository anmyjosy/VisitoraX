import { Inter } from "next/font/google";
import "./globals.css";
import { APP_CONFIG_DEFAULTS } from "../app-config";
import ClientProvider from "./ClientProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: APP_CONFIG_DEFAULTS.pageTitle,
  description: APP_CONFIG_DEFAULTS.pageDescription,
  icons: {
    icon: APP_CONFIG_DEFAULTS.logo,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientProvider>
          <main>{children}</main>
        </ClientProvider>
      </body>
    </html>
  );
}
