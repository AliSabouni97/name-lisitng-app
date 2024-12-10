import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AddName from './components/AddName';
import UploadCSV from './components/UploadCSV';
import PendingNames from './components/PendingNames';

const App = () => {
    return (
        <Router>
            <div>
                <header>
                    <h1>Name Listing App</h1>
                    <nav>
                        <ul>
                            <li><Link to="/add-name">Add Name</Link></li>
                            <li><Link to="/upload-csv">Upload CSV</Link></li>
                            <li><Link to="/pending-names">Pending Names</Link></li>
                        </ul>
                    </nav>
                </header>
                <main>
                    <Routes>
                        <Route path="/add-name" element={<AddName />} />
                        <Route path="/upload-csv" element={<UploadCSV />} />
                        <Route path="/pending-names" element={<PendingNames />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
