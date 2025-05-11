import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  File,
  BarChart,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/projects", label: "Projects", icon: ClipboardList },
    { href: "/documents", label: "Documents", icon: File },
    { href: "/reports", label: "Reports", icon: BarChart },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex items-center justify-center h-16 px-4 bg-primary">
          <div className="text-xl font-bold text-white">Freelanly</div>
        </div>
        <div className="flex flex-col flex-grow px-4 pt-5 pb-4 overflow-y-auto">
          <div className="mt-5 flex-grow">
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-2 py-3 mt-1 text-sm font-medium rounded-md",
                      isActive
                        ? "text-primary bg-blue-50"
                        : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                    )}
                  >
                    <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-gray-400")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-2">
              <div className="flex-shrink-0">
                <Avatar>
                  <AvatarImage src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">Sarah Johnson</div>
                <div className="text-xs font-medium text-gray-500">sarah@example.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
