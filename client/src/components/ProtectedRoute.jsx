import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store';

/** 登录守卫：未登录跳转登录页，登录后原路返回 */
export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <div className="py-16 text-center text-slate-500">正在加载…</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}
