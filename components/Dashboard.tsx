// components/Dashboard.tsx

import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
        Dashboard
      </h1>

      <p style={{ marginTop: '12px', color: '#555' }}>
        Welcome to the New Biroea Production System dashboard.
      </p>

      <div style={{ marginTop: '24px' }}>
        <ul>
          <li>Production overview</li>
          <li>Inventory status</li>
          <li>Optimization results</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
