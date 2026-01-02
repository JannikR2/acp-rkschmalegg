import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLogin from '../UserLogin';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleUserSelect = (user) => {
    if (user.isAdmin) {
      navigate('/admin');
    } else {
      navigate(`/user/${user.id}`);
    }
  };

  return <UserLogin onUserSelect={handleUserSelect} />;
};

export default LoginPage;
