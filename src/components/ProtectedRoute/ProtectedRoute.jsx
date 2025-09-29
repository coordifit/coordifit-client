import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenManager } from '../../services/axiosInstance';

/**
 * 보호된 라우트 컴포넌트
 * 로그인 상태를 확인하고, 로그인하지 않은 경우 로그인 페이지로 리다이렉트
 */
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인 상태 확인
    if (!TokenManager.isLoggedIn()) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  // 로그인하지 않은 경우 null 반환 (리다이렉트 중)
  if (!TokenManager.isLoggedIn()) {
    return null;
  }

  // 로그인한 경우 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute;
