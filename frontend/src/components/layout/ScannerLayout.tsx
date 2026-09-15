import { Outlet } from "react-router-dom";
import ScannerHeader from "../scanner/ScannerHeader";

export default function ScannerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <ScannerHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
