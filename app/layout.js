import "leaflet/dist/leaflet.css";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: APP_NAME,
  description: "A mobile-first information hub for choir tours and trips.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
