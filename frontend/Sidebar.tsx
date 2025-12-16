import React from 'react';
import { User, SidebarConfig, NavItem } from '../types';
import { ThreeDotsIcon, Bars3Icon, TickupLogoIcon } from './Icons';
import UserProfile from './UserProfile';

interface SidebarProps {
  currentUser: User;
  onLogout: () => void;
  onEditProfile: () => void;
  onViewProfile: () => void;
  sidebarConfig: SidebarConfig;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const { currentUser, onLogout, onEditProfile, onViewProfile, sidebarConfig } = props;
  const { navItems } = sidebarConfig;
  
  const styles = {
      aside: 'bg-gray-50 text-brand-text dark:bg-slate-900 dark:text-slate-200',
      navItem: 'text-brand-subtext hover:bg-gray-200/60 hover:text-brand-text dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200',
      navItemActive: 'bg-gray-200 text-brand-text dark:bg-slate-700 dark:text-slate-100',
      divider: 'border-gray-200 dark:border-slate-700',
      userProfile: 'hover:bg-gray-200/60 dark:hover:bg-slate-800/60',
      footerContainer: 'border-t border-gray-200 dark:border-slate-700',
  };
  
  return (
    <aside className={`fixed top-0 right-0 h-full z-30 flex-col transition-all duration-300 ease-in-out hidden md:flex w-64 ${styles.aside}`}>
      <div className={`px-3 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between`}>
          <TickupLogoIcon className="h-8" />
      </div>

      <nav className="flex-grow p-2 overflow-y-auto">
          <ul className="space-y-1">
          {navItems.map((item) => {
              if (item.type === 'item') {
                  return (
                      <li key={item.id}>
                          <button
                              className={`w-full flex items-center text-right rounded-lg transition-colors font-medium p-2 ${styles.navItem} ${styles.navItemActive}`}
                              title={item.label}
                          >
                              <item.Icon className="w-5 h-5 flex-shrink-0" />
                              <span className="mr-3 whitespace-nowrap transition-opacity duration-300">{item.label}</span>
                          </button>
                      </li>
                  );
              }
              return null;
          })}
          </ul>
      </nav>

      <div className={`p-2 ${styles.footerContainer}`}>
           <div className={`flex items-center mb-2 justify-start space-x-2 space-x-reverse`}>
              <UserProfile 
                  currentUser={currentUser} 
                  onLogout={onLogout} 
                  onEditProfile={onEditProfile} 
                  onViewProfile={onViewProfile}
              />
              <div className="text-right">
                  <p className="font-semibold text-sm">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
          </div>
      </div>
    </aside>
  );
};
