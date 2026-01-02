import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserDashboard from '../UserDashboard';

const UserPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/persons/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setUser(result.data);
      } else {
        console.error('User not found');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Lade Benutzerdaten...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Benutzer nicht gefunden</h2>
        <button onClick={() => navigate('/login')}>Zurück zur Anmeldung</button>
      </div>
    );
  }

  return <UserDashboard user={user} onLogout={handleLogout} />;
};

export default UserPage;
