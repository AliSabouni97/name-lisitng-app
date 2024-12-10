// src/components/AddName.js
import React, { useState } from 'react';
import axios from 'axios';

const AddName = () => {
    const [formData, setFormData] = useState({
        id: '',
        area: '',
        code: '',
        name: '',
        mothersName: '',
        status: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/add-name', formData);
            console.log(response.data);
            alert('Name added successfully!');
        } catch (error) {
            console.error('Error adding name:', error);
            alert('Failed to add name.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="number" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required />
            <input type="text" name="area" placeholder="Area" value={formData.area} onChange={handleChange} required />
            <input type="number" name="code" placeholder="Code" value={formData.code} onChange={handleChange} required />
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            <input type="text" name="mothersName" placeholder="Mother's Name" value={formData.mothersName} onChange={handleChange} required />
            <input type="text" name="status" placeholder="Status" value={formData.status} onChange={handleChange} required />
            <button type="submit">Add Name</button>
        </form>
    );
};

export default AddName;