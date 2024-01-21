import React, { useState } from 'react';
import { Link , useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { authState } from './utils/authState.js';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [auth, setAuth] = useRecoilState(authState);
  const navigate = useNavigate();

  const login = async () => {
    try {
      const response = await axios.post('http://localhost:3000/login', { email, password });
      const { user, token } = response.data;
      setAuth({ isAuthenticated: true, token });
      localStorage.setItem('authToken', token);

      navigate('/');
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="w-screen flex items-center justify-center">
      <div className="shadow-xl rounded-md flex flex-col items-center justify-center">
        <div  className="font-medium text-blue-900 text-2xl pt-9">Sign in</div>
        <div className="text-xl text-gray-500 py-7">Welcome, login to continue</div>
        <div className="flex-col flex w-23-rem text-base mx-10">
      <input className="border border-gray-300 px-2 py-1 my-3" type="email" placeholder="Email" onChange={(e)=>{setEmail(e.target.value)}} />
      <input className="border border-gray-300 px-2 py-1 my-3" type="password" placeholder="password" onChange={(e)=>{setPassword(e.target.value)}} />
      <button className="border-blue-800 border bg-blue-900 text-white text-xl py-2 mt-6 rounded-sm font-medium  " onClick={login}>Sign in</button>
      <div className="px-9 text-gray-500 py-7 mb-10">Don't have an account? <Link to={"/register"} className="text-blue-800 underline">Register</Link></div>
    </div>
      </div>
      </div>
  )
}
export default SignIn