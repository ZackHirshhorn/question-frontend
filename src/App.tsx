import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import Auth from './components/Auth';
import TopMenu from './components/TopMenu';
import Templates from './components/templates/Templates';
import Responses from './components/questionnaires/Responses';
import TemplateView from './components/templates/TemplateView';
import MainLayout from './components/MainLayout';
import Questions from './components/questions/Questions';
import AnswerPage from './components/filling/AnswerPage';
import AnswerFill from './components/filling/AnswerFill';
import { logout as logoutAction, setAuthenticated } from './store/userSlice';
import { headUserTemplates } from './api/template';
import { logout as logoutApi } from './api/auth';
import type { RootState } from './store';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [bootstrapping, setBootstrapping] = useState(true);

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

  // Bootstrap session from server cookie without storing credentials
  useEffect(() => {
    (async () => {
      try {
        // Use a lightweight HEAD probe on the same endpoint used for listing
        await headUserTemplates();
        dispatch(setAuthenticated(true));
      } catch {
        // Not authenticated or request failed; leave as unauthenticated
      } finally {
        setBootstrapping(false);
      }
    })();
  }, [dispatch]);

  return (
    <>
      {isAuthenticated && (
        <div style={{ position: 'absolute', top: '40px', right: '80px', zIndex: 1001 }}>
          <TopMenu
            isLoggedIn={true}
            onLogin={() => {}}
            onLogout={handleLogout}
          />
        </div>
      )}

      <div className="main-container">
        <Routes>
          {/* Public routes */}
          <Route path="/start/:templateId" element={<AnswerPage />} />
          <Route path="/answer/:id" element={<AnswerFill />} />
          <Route path="/login" element={<Auth />} />

          {/* Protected routes */}
          {!bootstrapping && (
            <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}>
              <Route path="/" element={<Templates onTemplateClick={handleSelectTemplate} />} />
              <Route path="/templates" element={<Templates onTemplateClick={handleSelectTemplate} />} />
              <Route path="/templates/:templateId" element={<TemplateView onBack={handleBack} />} />
              <Route path="/responses" element={<Responses />} />
              <Route path="/questions" element={<Questions />} />
            </Route>
          )}
        </Routes>
      </div>
    </>
  );
}

export default App;
