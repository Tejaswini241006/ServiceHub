import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Wrench } from "lucide-react";

export default function Navbar() {
  const { user, logout, isAdmin, isProvider } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const dashboardLink = isAdmin ? "/admin" : isProvider ? "/provider/dashboard" : "/dashboard";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-surface-900">ServiceHub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/services" className="text-surface-600 hover:text-primary-600 font-medium transition-colors">
              Browse Services
            </Link>

            {!user ? (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-surface-700 font-medium hover:text-primary-600 transition-colors">
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-surface-700 hover:text-primary-600 font-medium transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 text-sm font-bold">{user.name[0].toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:block">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-surface-200 py-1 animate-fade-in">
                    <div className="px-4 py-2 border-b border-surface-100">
                      <p className="text-xs text-surface-500 capitalize">{user.role}</p>
                      <p className="text-sm font-semibold text-surface-900 truncate">{user.email}</p>
                    </div>
                    <Link
                      to={dashboardLink}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-surface-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-surface-200 py-4 space-y-2 animate-fade-in">
            <Link to="/services" className="block px-4 py-2 text-surface-700 font-medium" onClick={() => setMenuOpen(false)}>
              Browse Services
            </Link>
            {!user ? (
              <>
                <Link to="/login" className="block px-4 py-2 text-surface-700 font-medium" onClick={() => setMenuOpen(false)}>Log In</Link>
                <Link to="/register" className="block px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold mx-4" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            ) : (
              <>
                <Link to={dashboardLink} className="block px-4 py-2 text-surface-700 font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 font-medium">Log Out</button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
