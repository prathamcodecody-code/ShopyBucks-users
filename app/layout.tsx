import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/app/context/AuthContext";
import { WishlistProvider } from "@/app/context/WishlistContext";
import { CheckoutProvider } from "@/app/context/CheckoutContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brandCream/30">
        <AuthProvider>
          <WishlistProvider>
            <CheckoutProvider>

              <Toaster position="top-right" />

              <Navbar />

              <main className="min-h-[calc(100vh-160px)]">
                {children}
              </main>

              <Footer />

            </CheckoutProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
