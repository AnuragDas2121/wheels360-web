import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, User, Car, LogOut, LayoutDashboard, MessageSquare } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary font-montserrat">
                Wheels<span className="text-secondary">360</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/"
                className={`navbar-item font-medium ${
                  location === "/" ? "text-primary" : "text-neutral-dark hover:text-primary"
                } transition`}
              >
                Home
              </Link>
              <Link 
                to="/cars"
                className={`navbar-item font-medium ${
                  location.startsWith("/cars") ? "text-primary" : "text-neutral-dark hover:text-primary"
                } transition`}
              >
                Browse Cars
              </Link>
              <Link 
                to="/dealers"
                className={`navbar-item font-medium ${
                  location.startsWith("/dealers") ? "text-primary" : "text-neutral-dark hover:text-primary"
                } transition`}
              >
                Dealers
              </Link>
              <Link 
                to="/compare"
                className={`navbar-item font-medium ${
                  location === "/compare" ? "text-primary" : "text-neutral-dark hover:text-primary"
                } transition`}
              >
                Compare
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <User className="h-4 w-4" />
                      {user.firstName || user.username}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex w-full cursor-pointer items-center">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === "dealer" && (
                      <DropdownMenuItem asChild>
                        <Link to="/dealer-dashboard" className="flex w-full cursor-pointer items-center">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dealer Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex w-full cursor-pointer items-center">
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/messages" className="flex w-full cursor-pointer items-center">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Messages
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="flex w-full cursor-pointer items-center text-left"
                      >
                        <LogOut className={`mr-2 h-4 w-4 ${logoutMutation.isPending ? 'animate-spin' : ''}`} />
                        {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link 
                    to="/auth" 
                    className="font-medium text-primary hover:text-primary-light transition mr-6"
                  >
                    Log in
                  </Link>
                  <Link to="/auth?tab=register">
                    <Button className="bg-primary hover:bg-primary-light">Register</Button>
                  </Link>
                </>
              )}
            </div>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-neutral-dark hover:text-primary transition"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="text-2xl font-bold text-primary font-montserrat">
                    Wheels<span className="text-secondary">360</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="py-6">
                  <nav className="flex flex-col space-y-4">
                    <Link 
                      to="/"
                      className={`text-lg font-medium ${
                        location === "/" ? "text-primary" : "text-neutral-dark"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link 
                      to="/cars"
                      className={`text-lg font-medium ${
                        location.startsWith("/cars") ? "text-primary" : "text-neutral-dark"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Browse Cars
                    </Link>
                    <Link 
                      to="/dealers"
                      className={`text-lg font-medium ${
                        location.startsWith("/dealers") ? "text-primary" : "text-neutral-dark"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dealers
                    </Link>
                    <Link 
                      to="/compare"
                      className={`text-lg font-medium ${
                        location === "/compare" ? "text-primary" : "text-neutral-dark"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Compare
                    </Link>
                    <div className="h-px bg-neutral-light my-2"></div>
                    {user ? (
                      <>
                        <Link
                          to="/dashboard"
                          className="text-lg font-medium text-neutral-dark"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/messages"
                          className="text-lg font-medium text-neutral-dark"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Messages
                        </Link>
                        {user.role === "dealer" && (
                          <Link
                            to="/dealer-dashboard"
                            className="text-lg font-medium text-neutral-dark"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Dealer Dashboard
                          </Link>
                        )}
                        {user.role === "admin" && (
                          <Link
                            to="/admin"
                            className="text-lg font-medium text-neutral-dark"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          disabled={logoutMutation.isPending}
                          className="text-lg font-medium text-neutral-dark text-left flex items-center"
                        >
                          <LogOut className={`mr-2 h-4 w-4 ${logoutMutation.isPending ? 'animate-spin' : ''}`} />
                          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/auth"
                          className="text-lg font-medium text-neutral-dark"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Log in
                        </Link>
                        <Link
                          to="/auth?tab=register"
                          className="text-lg font-medium text-secondary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Register
                        </Link>
                      </>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
