import React, { useState } from 'react';
import type { Credentials, User } from '../types';
import { Spinner } from './Spinner';
import { apiService } from '../services/apiService';

interface LoginScreenProps {
    onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (username && password) {
            setIsLoading(true);
            setError(null);
            try {
                const user = await apiService.login({ username, password });
                onLogin(user);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">API CRUD Manager</h1>
                    <p className="text-gray-300 mt-2">Please log in to continue</p>
                </div>
                {error && (
                    <div className="bg-red-500/50 text-white p-3 rounded-lg mb-4 text-center border border-red-500">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                            className="w-full px-4 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                            className="w-full px-4 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-300"
                    >
                        {isLoading ? <Spinner /> : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};