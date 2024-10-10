import React, { useState } from 'react';

const FetchButton = () => {
  const [email, setEmail] = useState('suxcesagency@gmail.com');
  const handleFetch = async () => {
    try {
      const response = await fetch('https://6jzlpghplfcqc5vrri6qbqhi6u0unxmi.lambda-url.us-east-1.on.aws/', {
        method: 'POST',
        body: JSON.stringify({
          "email": email,
          "template" : "0",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
      />
      <button onClick={handleFetch}>Send Email</button>
    </div>
  );
};

export default FetchButton;