import React, { useState } from 'react';

const FetchButton = () => {
  const [email, setEmail] = useState('suxcesagency@gmail.com');
  const [template, setTemplate] = useState('default');

  const templates = {
    default: `
      <html>
        <body>
          <h1>Hello World!</h1>
          <p>This is a test email.</p>
        </body>
      </html>
    `,
    template1: `
      <html>
        <body>
          <h2>Template 1</h2>
          <p>This is template 1.</p>
        </body>
      </html>
    `,
    template2: `
      <html>
        <body>
          <h2>Template 2</h2>
          <p>This is template 2.</p>
        </body>
      </html>
    `,
    template3: `
      <html>
        <body>
          <h2>Template 3</h2>
          <p>This is template 3.</p>
        </body>
      </html>
    `,
    template4: `
      <html>
        <body>
          <h2>Template 4</h2>
          <p>This is template 4.</p>
        </body>
      </html>
    `,
  };

  const handleFetch = async () => {
    try {
      const response = await fetch('https://6jzlpghplfcqc5vrri6qbqhi6u0unxmi.lambda-url.us-east-1.on.aws/', {
        method: 'POST',
        body: JSON.stringify({
          email,
          template,
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
      <select value={template} onChange={(e) => setTemplate(e.target.value)}>
        {Object.keys(templates).map((key) => (
          <option key={key} value={key}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </option>
        ))}
      </select>
      <button onClick={handleFetch}>Send Email</button>
    </div>
  );
};

export default FetchButton;