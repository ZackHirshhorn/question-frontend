import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Auth from './components/Auth';
import TopMenu from './components/TopMenu';
import Templates from './components/Templates';
import Responses from './components/Responses';
import TemplateView from './components/TemplateView';
import MainLayout from './components/MainLayout';
import Questions from './components/Questions';
import { logout as logoutAction } from './store/userSlice';
import { logout as logoutApi } from './api/auth';
import type { RootState } from './store';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    navigate(`/templates/${templateId}`);
  };

  const handleBack = () => {
    navigate('/templates');
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
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Templates onTemplateClick={handleSelectTemplate} />} />
                <Route path="/templates" element={<Templates onTemplateClick={handleSelectTemplate} />} />
                <Route path="/templates/:templateId" element={<TemplateView onBack={handleBack} />} />
                <Route path="/responses" element={<Responses />} />
                <Route path="/questions" element={<Questions />} />
              </Route>
            </Routes>
          </div>
        </>
      ) : (
        <Auth />
      )}
    </>
  );
}

export default App;
