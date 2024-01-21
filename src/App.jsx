// App.jsx
import React from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';

import Navbar from './components/Navbar';
import QrData from './components/QrData';
import GenerateQrCode from './components/GenerateQrCode';
import ScanQrCode from './components/ScanQrCode';
import Register from './components/Register';
import SignIn from './components/SignIn';
import Edit from './components/Edit';
import { useRecoilValue } from 'recoil';
import { authState } from './components/utils/authState';


const App = () => {
  const auth = useRecoilValue(authState);
  return (

    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<QrData />} />
        <Route path="/generate-qr-code" element={<GenerateQrCode />} />
        <Route path="/scan-qr-code" element={<ScanQrCode />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/edit/:id" element={auth.isAuthenticated ? (<Edit />) : (<Navigate to="/login" />)}
        />
      </Routes>
    </BrowserRouter>

  );
};

export default App;
