import React, { useState } from 'react';

const Switcher1 = () => {
  const [status, setStatus] = useState('pending');

  return (
    <div className="flex gap-2">
      <button
        className={`px-4 py-2 rounded ${status === 'pending' ? 'bg-yellow-400 text-white' : 'bg-gray-200'}`}
        onClick={() => setStatus('pending')}
      >
        Pending
      </button>
      <button
        className={`px-4 py-2 rounded ${status === 'success' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        onClick={() => setStatus('success')}
      >
        Success
      </button>
    </div>
  );
};

export default Switcher1;
