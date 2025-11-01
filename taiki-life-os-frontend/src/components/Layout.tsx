import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NotionSyncButton from './NotionSyncButton';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                <img 
                  src="/icons/AppIcon_1024_black.png" 
                  alt="Life OS" 
                  className="w-8 h-8"
                />
              </div>
              <h1 className="text-xl font-black text-gray-900">Life OS</h1>
            </Link>
            <NotionSyncButton />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-gray-200 shadow-2xl z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around items-center h-20">
            <Link
              to="/"
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200 ${
                isActive('/') 
                  ? 'text-black scale-110' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isActive('/') ? 'bg-black text-white' : 'hover:bg-gray-100'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-xs font-bold mt-1">Home</span>
            </Link>

            <Link
              to="/start"
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200 ${
                isActive('/start') 
                  ? 'text-black scale-110' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isActive('/start') ? 'bg-black text-white' : 'hover:bg-gray-100'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-bold mt-1">Start</span>
            </Link>

            <Link
              to="/tasks"
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200 ${
                isActive('/tasks') 
                  ? 'text-black scale-110' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isActive('/tasks') ? 'bg-black text-white' : 'hover:bg-gray-100'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xs font-bold mt-1">Tasks</span>
            </Link>

            <Link
              to="/review"
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200 ${
                isActive('/review') 
                  ? 'text-black scale-110' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isActive('/review') ? 'bg-black text-white' : 'hover:bg-gray-100'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-xs font-bold mt-1">Review</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ボトムナビゲーション分のスペース確保 */}
      <div className="h-20"></div>
    </div>
  );
}

export default Layout;
