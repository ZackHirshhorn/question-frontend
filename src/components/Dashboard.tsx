import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../store/userSlice';
import type { RootState } from '../store';
import { getQuestionnaires } from '../api/questionnaire';
import { logout as logoutApi } from '../api/auth';

interface Questionnaire {
  id: string;
  templateId: string;
  user: object;
  userPhone: string;
  userName:string;
  userEmail: string;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getQuestionnaires()
        .then(response => {
          setQuestionnaires(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch questionnaires:', error);
          setError('Failed to fetch questionnaires');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

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
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Welcome, {user?.name}!</h2>
        <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
      {loading ? (<div>Loading...</div>) : error ? (
        <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>
      ) : (
        <>
          <h3>Here are your questionnaires:</h3>
          <ul style={{ listStyleType: 'none', padding: 0, marginTop: '20px' }}>
            {questionnaires.map((q) => (
              <li
                key={q.id}
                style={{
                  padding: '15px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <div><strong>User:</strong> {q.userName} ({q.userEmail})</div>
                <div><strong>Status:</strong> {q.isComplete ? 'Completed' : 'Pending'}</div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Dashboard;