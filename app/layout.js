import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider"; // adjust path if needed
import { Toaster } from 'react-hot-toast';
import Chatbot from "@/components/Chatbot";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Wrap the app content with StoreProvider */}
        <StoreProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Chatbot/>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#4CAF50',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
              },
            }}
          />
        </StoreProvider>
      </body>
    </html>
  );
}
