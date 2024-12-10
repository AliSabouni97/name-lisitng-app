import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AddName from './components/AddName';
import UploadCSV from './components/UploadCSV';
import PendingNames from './components/PendingNames';
import VerifiedNames from './components/VerifiedNames';
import Login from './components/Login';
import Register from './components/Register';

const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const isAdmin = token !== null; // For simplicity, we'll use the presence of a token to determine if the user is an admin.

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    return (
        <Router>
            <div>
                <header>
                    <h1>Name Listing App</h1>
                    <nav>
                        <ul>
                            {isAdmin ? (
                                <>
                                    <li><Link to="/add-name">Add Name</Link></li>
                                    <li><Link to="/upload-csv">Upload CSV</Link></li>
                                    <li><Link to="/pending-names">Pending Names</Link></li>
                                    <li><Link to="/register">Register User</Link></li>
                                    <li><button onClick={handleLogout}>Logout</button></li>
                                </>
                            ) : (
                                <li><Link to="/login">Login</Link></li>
                            )}
                            <li><Link to="/verified-names">Verified Names</Link></li>
                        </ul>
                    </nav>
                </header>
                <main>
                    <Routes>
                        {isAdmin && (
                            <>
                                <Route path="/add-name" element={<AddName token={token} />} />
                                <Route path="/upload-csv" element={<UploadCSV token={token} />} />
                                <Route path="/pending-names" element={<PendingNames token={token} />} />
                                <Route path="/register" element={<Register token={token} />} />
                            </>
                        )}
                        <Route path="/login" element={<Login setToken={setToken} />} />
                        <Route path="/verified-names" element={<VerifiedNames />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
