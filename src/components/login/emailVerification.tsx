import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const EmailVerification: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate(); 

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                await axios.get(`http://localhost:3000/api/auth/mail?token=${token}`);
                toast.success('Email verified successfully!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } catch (error) {
                console.error('Email verification failed:', error);
                toast.error("Email verification failed");
            }
        };

        verifyEmail();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-6">Verifying Email...</h1>
                <p className="text-gray-600">Please wait while we verify your email.</p>
            </div>
        </div>
    );
};

export default EmailVerification;
