import React, { useEffect, useState } from 'react';
import API from '../services/api';

const GrievanceList = () => {
  const [grievances, setGrievances] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await API.get('/grievances');
      setGrievances(res.data);
    };
    fetchData();
  }, []);

  return (
    <ul>
      {grievances.map((g) => (
        <li key={g._id}>{g.title} - {g.status}</li>
      ))}
    </ul>
  );
};

export default GrievanceList;
