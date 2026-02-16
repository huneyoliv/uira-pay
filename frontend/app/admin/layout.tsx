import Link from "next/link"
import { LayoutDashboard, Users, FileText, Settings, LogOut } from "lucide-react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-primary">Admin</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/admin/tenants" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Users size={20} />
                        <span>Tenants</span>
                    </Link>
                    <Link href="/admin/logs" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <FileText size={20} />
                        <span>Logs</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
