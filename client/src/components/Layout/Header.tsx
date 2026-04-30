import React from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <div className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between flex-shrink-0">
      <h1 className="text-base font-semibold text-gray-900 tracking-tight">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-4.5 h-4.5 text-gray-500" style={{ width: '18px', height: '18px' }} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand rounded-full ring-2 ring-white" />
        </button>
      </div>
    </div>
  );
};

export default Header;