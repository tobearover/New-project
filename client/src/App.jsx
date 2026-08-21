import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Exams from './pages/Exams';
import Words from './pages/Words';
import WordDetail from './pages/WordDetail';
import Scan from './pages/Scan';
import Wordbook from './pages/Wordbook';
import Review from './pages/Review';
import Quiz from './pages/Quiz';
import History from './pages/History';
import Login from './pages/Login';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/words" element={<Words />} />
        <Route path="/words/:id" element={<WordDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
        <Route path="/wordbook" element={<ProtectedRoute><Wordbook /></ProtectedRoute>} />
        <Route path="/review" element={<ProtectedRoute><Review /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="*" element={<div className="py-16 text-center text-slate-500">页面不存在</div>} />
      </Routes>
    </Layout>
  );
}
