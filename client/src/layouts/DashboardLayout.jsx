import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="ave-portal-shell min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />
        <main className="portal-content flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
