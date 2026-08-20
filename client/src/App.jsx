import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Exams from './pages/Exams';
import Words from './pages/Words';
import WordDetail from './pages/WordDetail';
import Scan from './pages/Scan';
import Wordbook from './pages/Wordbook';
import Review from './pages/Review';
import Quiz from './pages/Quiz';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/words" element={<Words />} />
        <Route path="/words/:id" element={<WordDetail />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/wordbook" element={<Wordbook />} />
        <Route path="/review" element={<Review />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="*" element={<div className="py-16 text-center text-slate-500">页面不存在</div>} />
      </Routes>
    </Layout>
  );
}
