// src/components/PendingNames.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PendingNames = ({ token }) => {
    const [pendingNames, setPendingNames] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        const fetchPendingNames = async () => {
            try {
                const response = await axios.get('http://localhost:3000/pending', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setPendingNames(response.data);
            } catch (error) {
                console.error('Error fetching pending names:', error);
            }
        };

        fetchPendingNames();
    }, [token]);

    const handleCheckboxChange = (id) => {
        setSelectedIds((prevSelectedIds) =>
            prevSelectedIds.includes(id)
                ? prevSelectedIds.filter((selectedId) => selectedId !== id)
                : [...prevSelectedIds, id]
        );
    };

    const handleVerify = async () => {
        try {
            const response = await axios.post('http://localhost:3000/verify', { ids: selectedIds }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response.data);
            alert('Names verified successfully!');
            // Refresh the pending names list
            const updatedPendingNames = pendingNames.filter((name) => !selectedIds.includes(name._id));
            setPendingNames(updatedPendingNames);
            setSelectedIds([]);
        } catch (error) {
            console.error('Error verifying names:', error);
            alert('Failed to verify names.');
        }
    };

    return (
        <div>
            <h2>Pending Names</h2>
            <ul>
                {pendingNames.map((name) => (
                    <li key={name._id}>
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(name._id)}
                            onChange={() => handleCheckboxChange(name._id)}
                        />
                        {name.id} - {name.area} - {name.code} - {name.name} - {name.mothersName} - {name.status}
                    </li>
                ))}
            </ul>
            <button onClick={handleVerify} disabled={selectedIds.length === 0}>
                Verify Selected Names
            </button>
        </div>
    );
};

export default PendingNames;