// src/components/PendingNames.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PendingNames = () => {
    const [pendingNames, setPendingNames] = useState([]);

    useEffect(() => {
        const fetchPendingNames = async () => {
            try {
                const response = await axios.get('http://localhost:3000/pending');
                setPendingNames(response.data);
            } catch (error) {
                console.error('Error fetching pending names:', error);
            }
        };

        fetchPendingNames();
    }, []);

    return (
        <div>
            <h2>Pending Names</h2>
            <ul>
                {pendingNames.map((name) => (
                    <li key={name._id}>
                        {name.id} - {name.area} - {name.code} - {name.name} - {name.mothersName} - {name.status}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PendingNames;