import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Settings } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", path: "/" },
    { name: "Monitoramento", href: "/monitoring", path: "/monitoring" },
    { name: "Recomendações", href: "/recommendations", path: "/recommendations" },
    { name: "Calculadora", href: "/calculator", path: "/calculator" },
    { name: "Profissional", href: "/professional", path: "/professional" },
  ];

  return (
    <header className="border-b bg-card px-4 lg:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V3zM3 7a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V7zM3 11a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-foreground">AgriScience BR</span>
        </Link>
        
        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-6 ml-6">
          {navigation.map((item) => {
            const isActive = location === item.path || (item.path === "/" && location === "/dashboard");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`link-${item.name.toLowerCase()}`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Menu */}
      <div className="flex items-center space-x-4">
        {user && (
          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-sm text-muted-foreground" data-testid="text-user-name">
              {user.firstName} {user.lastName}
            </span>
            <Badge variant={user.role === "agronomist" ? "default" : "secondary"} data-testid="badge-user-role">
              {user.role === "agronomist" ? "Agrônomo" : "Produtor"}
            </Badge>
            {user.isPremium && (
              <Badge variant="outline" className="bg-accent text-accent-foreground" data-testid="badge-premium">
                Premium
              </Badge>
            )}
          </div>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="menu-item-profile">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-item-settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} data-testid="menu-item-logout">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
