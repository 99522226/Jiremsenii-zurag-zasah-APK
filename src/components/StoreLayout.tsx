"use client";
import Navbar from "./Navbar";
import CartDrawer from "./CartDrawer";
import Footer from "./Footer";
import InstallPrompt from "./InstallPrompt";
import ChatWidget from "./ChatWidget";
import { ReactNode } from "react";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
      <InstallPrompt />
      <ChatWidget />
    </>
  );
}
