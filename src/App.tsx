import { useState } from 'react'; // Import useState
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import Auth from './components/Auth';
import TopMenu from './components/TopMenu';
import TopBar from './components/TopBar';
import Templates from './components/Templates';
import Responses from './components/Responses';
import TemplateView from './components/TemplateView';
import { logout as logoutAction } from './store/userSlice';
import { logout as logoutApi } from './api/auth';
import type { RootState } from './store';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'questionnaires' | 'responses'>('questionnaires');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout failed on server', error);
    } finally {
      dispatch(logoutAction());
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleBack = () => {
    setSelectedTemplateId(null);
  };

  return (
    <>
      {isAuthenticated ? (
        <>
          <div style={{ position: 'absolute', top: '40px', right: '80px', zIndex: 1001 }}>
            <TopMenu
              isLoggedIn={true}
              onLogin={() => {}}
              onLogout={handleLogout}
            />
          </div>

          <div className="main-container">
            {selectedTemplateId ? (
              <TemplateView templateId={selectedTemplateId} onBack={handleBack} />
            ) : (
              <>
                <TopBar activeTab={activeTab} onTabChange={setActiveTab} />
                {activeTab === 'questionnaires' && <Templates onTemplateClick={handleSelectTemplate} />}
                {activeTab === 'responses' && <Responses />}
              </>
            )}
          </div>
        </>
      ) : (
        <Auth />
      )}
    </>
  );
}

export default App;

