import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/app/context/AuthContext";
import { WishlistProvider } from "@/app/context/WishlistContext";
import { CheckoutProvider } from "@/app/context/CheckoutContext";
import { AuthModalProvider } from "@/app/auth/AuthModalContext";
import { Toaster } from "react-hot-toast";
import AuthModalWrapper from "@/components/Home/AuthModalWrapper";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-MG7FW7KHKE"
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-MG7FW7KHKE');
        `}
      </Script>

      <body className="bg-white flex flex-col min-h-screen">
        <AuthProvider>
          <WishlistProvider>
            <CheckoutProvider>
              <AuthModalProvider>
                <Toaster position="top-right" />

                <header className="relative z-[100]">
                  <Navbar />
                </header>

                <main className="relative z-0 flex-grow">
                  {children}
                </main>

                <Footer />
                <AuthModalWrapper />
              </AuthModalProvider>
            </CheckoutProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
