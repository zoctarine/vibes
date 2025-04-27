import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" />;
  }

  return <RegisterForm />;
};

export default RegisterPage;