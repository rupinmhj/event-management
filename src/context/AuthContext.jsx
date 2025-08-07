import { createContext, useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [email, setEmail] = useState(null);
    const [role, setRole] = useState(null);


    useEffect(() => {
        const encryptedAccess = Cookies.get('access_token');
        const storedEmail = localStorage.getItem('email');
        const storedRole = localStorage.getItem('role')
        const init = () => {
            if (encryptedAccess) {
                try {
                    const decryptedAccess = CryptoJS.AES.decrypt(encryptedAccess, SECRET_KEY).toString(CryptoJS.enc.Utf8);
                    setAuthTokens({ access: decryptedAccess });
                } catch (err) {
                    console.error('Access token decryption failed', err);
                    logout();
                }
            }

            if (storedEmail) {
                setEmail(storedEmail);
            }
            if (storedRole) {
                setRole(storedRole);
            }

            setAuthReady(true);
            setIsLoading(false);
        };

        init();
    }, []);

    const login = (access, refresh, email, role, user_full_name) => {
        if (access) {
            const encryptedAccess = CryptoJS.AES.encrypt(access, SECRET_KEY).toString();
            Cookies.set('access_token', encryptedAccess, { expires: 1 });
            setAuthTokens({ access: access });
        }
        localStorage.setItem('email', email);
        localStorage.setItem('role', role);
        localStorage.user_full_name('user_full_name', user_full_name);
    };

    const logout = () => {
        setAuthTokens(null);
        setEmail(null);
        Cookies.remove('access');
        localStorage.removeItem('email');
        localStorage.removeItem('role');

    };

    return (
        <AuthContext.Provider
            value={{
                authTokens,
                login,
                logout,
                email,
                setEmail,
                authReady,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
