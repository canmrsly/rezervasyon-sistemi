import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import BookingPage from './pages/BookingPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    {/* Varsayılan olarak 1 ID'li işletmeye yönlendiriyoruz (Demo için) */}
                    <Route index element={<Navigate to="/business/1" replace />} />
                    <Route path="business/:businessId" element={<BookingPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
