import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StartSession from './pages/StartSession';
import StopSession from './pages/StopSession';
import Review from './pages/Review';
import Tasks from './pages/Tasks';
import Layout from './components/Layout';
import OfflineIndicator from './components/OfflineIndicator';
import { setupOnlineStatusMonitoring, requestNotificationPermission } from './services/offlineService';

function App() {
  useEffect(() => {
    // オンライン/オフライン状態の監視を開始
    setupOnlineStatusMonitoring();
    
    // 通知権限をリクエスト
    requestNotificationPermission();
  }, []);

  return (
    <Router>
      <OfflineIndicator />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/start" element={<StartSession />} />
          <Route path="/stop" element={<StopSession />} />
          <Route path="/review" element={<Review />} />
          <Route path="/tasks" element={<Tasks />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
