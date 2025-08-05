import { useState } from 'react'; // Import useState
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import Auth from './components/Auth';
import TopMenu from './components/TopMenu';
import TopBar from './components/TopBar';
import Questionnaires from './components/Questionnaires';
import { logout as logoutAction } from './store/userSlice';
import { logout as logoutApi } from './api/auth';
import type { RootState } from './store';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'questionnaires' | 'responses'>('questionnaires');

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout failed on server', error);
    } finally {
      dispatch(logoutAction());
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <>
          {/* TopMenu remains outside the main container, positioned absolutely */}
          <div style={{ position: 'absolute', top: '40px', right: '80px', zIndex: 1001 }}>
            <TopMenu
              isLoggedIn={true}
              onLogin={() => {}} // Not applicable when logged in
              onLogout={handleLogout}
            />
          </div>

          {/* Main container for centered content */}
          <div className="main-container">
            <TopBar activeTab={activeTab} onTabChange={setActiveTab} />
            {activeTab === 'questionnaires' && <Questionnaires />}
            {activeTab === 'responses' && <div>Content for תגובות will go here.</div>}
          </div>
        </>
      ) : (
        <Auth />
      )}
    </>
  );
}


export default App;

