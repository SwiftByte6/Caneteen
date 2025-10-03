import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "User Dashboard",
};

export default function UserLayout({ children }) {
  return (
      <main className="flex-1 ">
        <Navbar/>
        {children}
      </main>

  );
}
