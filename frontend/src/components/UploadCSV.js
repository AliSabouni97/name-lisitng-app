// src/components/UploadCSV.js
import React, { useState } from 'react';
import axios from 'axios';

const UploadCSV = ({ token }) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:3000/upload/csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response.data);
            alert('CSV uploaded successfully!');
        } catch (error) {
            console.error('Error uploading CSV:', error);
            alert('Failed to upload CSV.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="file" onChange={handleFileChange} required />
            <button type="submit">Upload CSV</button>
        </form>
    );
};

export default UploadCSV;