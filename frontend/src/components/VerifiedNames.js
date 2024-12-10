// src/components/VerifiedNames.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VerifiedNames = () => {
    const [verifiedNames, setVerifiedNames] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchVerifiedNames = async () => {
            try {
                const response = await axios.get('http://localhost:3000/names');
                setVerifiedNames(response.data);
            } catch (error) {
                console.error('Error fetching verified names:', error);
            }
        };

        fetchVerifiedNames();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredNames = verifiedNames.filter((name) =>
        name.name && name.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h2>Verified Names</h2>
            <input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={handleSearch}
            />
            <ul>
                {filteredNames.map((name) => (
                    <li key={name._id}>
                        {name.id} - {name.area} - {name.code} - {name.name} - {name.mothersName} - {name.status}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default VerifiedNames;