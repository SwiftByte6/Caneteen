import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SideBar from "@/components/SideBar";

export const metadata = {
  title: "User Dashboard",
};

export default function UserLayout({ children }) {
  return (
      <main className="flex p-8">
        <SideBar/>
        {children}
      </main>

  );
}
