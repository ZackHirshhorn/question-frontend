import { useSelector } from 'react-redux';
import './App.css';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import type { RootState } from './store';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  return (
    <>
      {isAuthenticated ? <Dashboard /> : <Auth />}
    </>
  );
}

export default App;