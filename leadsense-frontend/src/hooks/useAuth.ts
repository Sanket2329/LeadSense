import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi, type LoginRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export function useLogin() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  return useMutation({
    mutationFn: (req: LoginRequest) => authApi.login(req),
    onSuccess: data => {
      login(data.token);
      toast.success('Logged in successfully');
      navigate('/', { replace: true });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useLogout() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  return () => {
    logout();
    navigate('/login', { replace: true });
    toast.success('Logged out');
  };
}
