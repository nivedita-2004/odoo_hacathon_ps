import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  Compass,
  Wallet,
  Briefcase,
  UserCircle,
  Settings2,
  LogOut,
  Menu,
  ChevronRight,
  Globe2,
  Luggage
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, desc: 'Overview' },
  { name: 'My Trips', href: '/trips', icon: Compass, desc: 'Your adventures' },
  { name: 'Destinations', href: '/cities', icon: Globe2, desc: 'Explore cities' },
  { name: 'Budget', href: '/budget', icon: Wallet, desc: 'Track expenses' },
  { name: 'Packing', href: '/packing', icon: Briefcase, desc: 'Checklists' },
];

const userNavigation = [
  { name: 'Profile', href: '/profile', icon: UserCircle, desc: 'Your account' },
  { name: 'Settings', href: '/settings', icon: Settings2, desc: 'Preferences' },
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed */}
      <aside className={`
        fixed left-0 top-0 h-screen z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 via-primary-500 to-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Luggage className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">Traveloop</span>
              <p className="text-[10px] text-gray-400 font-medium tracking-wider">EXPLORE THE WORLD</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          {/* Main Menu */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Menu
            </p>
            {navigation.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden
                    ${active 
                      ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 font-semibold shadow-md border border-primary-200/50' 
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 hover:text-gray-900'
                    }
                  `}
                >
                  {/* Hover Background Effect - More Visible */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent 
                    transition-all duration-500 ease-out
                    ${hoveredItem === item.name && !active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}
                  `} />
                  
                  {/* Left Border Indicator on Hover */}
                  <div className={`
                    absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary-500
                    transition-all duration-300 ease-out
                    ${hoveredItem === item.name || active ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
                  `} />
                  
                  {/* Icon Container with Scale Effect */}
                  <div className={`
                    relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                    ${active 
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-lg group-hover:text-primary-500 group-hover:scale-105 group-hover:rotate-3'
                    }
                  `}>
                    <Icon className={`
                      w-5 h-5 transition-transform duration-300
                      ${hoveredItem === item.name && !active ? 'scale-110' : 'scale-100'}
                    `} />
                  </div>
                  
                  {/* Text Content with Slide Effect */}
                  <div className={`
                    relative z-10 flex-1 transition-all duration-300
                    ${hoveredItem === item.name && !active ? 'translate-x-1' : 'translate-x-0'}
                  `}>
                    <span className={`
                      block transition-all duration-300
                      ${hoveredItem === item.name && !active ? 'font-semibold text-gray-900' : ''}
                    `}>{item.name}</span>
                    <span className={`
                      block text-[10px] font-medium transition-all duration-300
                      ${active ? 'text-primary-600/70' : 'text-gray-400 group-hover:text-primary-400'}
                    `}>
                      {item.desc}
                    </span>
                  </div>
                  
                  {/* Active Indicator Dot */}
                  {active && (
                    <div className="relative z-10 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary-500 shadow-sm animate-pulse" />
                    </div>
                  )}
                  
                  {/* Chevron on Hover with Bounce */}
                  {!active && (
                    <ChevronRight className={`
                      relative z-10 w-5 h-5 text-primary-400 transition-all duration-300 ease-out
                      ${hoveredItem === item.name ? 'opacity-100 translate-x-0 scale-110' : 'opacity-0 -translate-x-4 scale-75'}
                    `} />
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Account Section */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Account
            </p>
            <div className="space-y-1">
              {userNavigation.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`
                      group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden
                      ${active 
                        ? 'bg-gradient-to-r from-gray-50 to-gray-100/50 text-gray-900 font-semibold shadow-md border border-gray-200/50' 
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 hover:text-gray-900'
                      }
                    `}
                  >
                    {/* Hover Background Effect */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-r from-gray-500/10 via-gray-500/5 to-transparent 
                      transition-all duration-500 ease-out
                      ${hoveredItem === item.name && !active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}
                    `} />
                    
                    {/* Left Border Indicator */}
                    <div className={`
                      absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gray-500
                      transition-all duration-300 ease-out
                      ${hoveredItem === item.name || active ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
                    `} />
                    
                    {/* Icon Container with Scale Effect */}
                    <div className={`
                      relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                      ${active 
                        ? 'bg-gray-800 text-white shadow-lg scale-110' 
                        : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-lg group-hover:text-gray-700 group-hover:scale-105 group-hover:rotate-3'
                      }
                    `}>
                      <Icon className={`
                        w-5 h-5 transition-transform duration-300
                        ${hoveredItem === item.name && !active ? 'scale-110' : 'scale-100'}
                      `} />
                    </div>
                    
                    {/* Text with Slide Effect */}
                    <div className={`
                      relative z-10 flex-1 transition-all duration-300
                      ${hoveredItem === item.name && !active ? 'translate-x-1' : 'translate-x-0'}
                    `}>
                      <span className={`
                        block transition-all duration-300
                        ${hoveredItem === item.name && !active ? 'font-semibold' : ''}
                      `}>{item.name}</span>
                      <span className={`
                        block text-[10px] font-medium transition-all duration-300
                        ${active ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'}
                      `}>
                        {item.desc}
                      </span>
                    </div>
                    
                    {/* Active Indicator */}
                    {active && (
                      <div className="relative z-10 w-2 h-2 rounded-full bg-gray-500 shadow-sm animate-pulse" />
                    )}
                    
                    {/* Chevron on Hover */}
                    {!active && (
                      <ChevronRight className={`
                        relative z-10 w-5 h-5 text-gray-400 transition-all duration-300 ease-out
                        ${hoveredItem === item.name ? 'opacity-100 translate-x-0 scale-110' : 'opacity-0 -translate-x-4 scale-75'}
                      `} />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-100 p-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/20">
                <span className="text-white font-bold text-lg">
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || ''}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-all duration-200 border border-gray-200 hover:border-red-200 group"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 flex-shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="ml-3 flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 via-primary-500 to-brand-500 rounded-lg flex items-center justify-center shadow-md shadow-primary-500/20">
              <Luggage className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">Traveloop</span>
          </div>
        </header>

        {/* Page Content - Only this scrolls */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
