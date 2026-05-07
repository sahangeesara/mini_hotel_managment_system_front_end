import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './page/admin/sidebar';
import Hotel from './page/admin/hotel/Hotel';
import HotelPage from './page/client/hotel/HotelPage';

function App() {
    return (
        <Router>

              <Routes>

                {/* Redirect root to client hotel page */}
                <Route path="/" element={<Navigate to="/hotel" replace />} />

                {/* Client Route */}
                <Route path="/hotel" element={<HotelPage />} />

                {/* Admin Route */}
                <Route
                    path="/admin/hotel"
                    element={
                        <>
                            <Sidebar />

                            <div className="main-content">
                                <Hotel />
                            </div>
                        </>
                    }
                />

            </Routes>

        </Router>
    );
}

export default App;
