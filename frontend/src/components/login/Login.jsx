import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [authStatus, setAuthStatus] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthFailed, setIsAuthFailed] = useState(false);
    const navigate = useNavigate();

    const handleUsername = (event) => {
        setUsername(event.target.value);
    }

    const handlePassword = (event) => {
        setPassword(event.target.value);
    }

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:5000/prm/auth/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            
            if (!response.ok) {
                setIsAuthFailed(true);
                throw new Error("Login failed");
            }

            const data = await response.json();
            if (data !== null && data.isSuccess && data.data.isAuthenticated) {
                setAuthStatus(true);
                localStorage.setItem('role', data.data.role);
                console.log(data.data);
                localStorage.setItem('username', data.data.username);
                navigate('/projects');
            }
        } catch (err) {
            console.error("Error logging in: ", err);
            setAuthStatus(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-full max-w-xs">
                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={handleUsername}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${isAuthFailed ? 'border-red-500' : ''}`}
                            id="password"
                            type="password"
                            placeholder="******************"
                            value={password}
                            onChange={handlePassword}
                        />
                        {isAuthFailed && <p className="text-red-500 text-xs italic">Incorrect username or password.</p>}
                    </div>
                    <div className="flex items-center justify-center">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={handleLogin}
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
