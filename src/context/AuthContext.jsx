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
    const [id, setId] = useState(null);
    const [phone_number, setPhone_number] = useState(null);
    const [fullName, setFullName] = useState(null);
    const [hasProfile, setHasProfile] = useState(false);


    useEffect(() => {
        const encryptedAccess = Cookies.get('access_token');
        // console.log('encrypted', encryptedAccess);
        const storedEmail = localStorage.getItem('email');
        const storedRole = localStorage.getItem('role');
        const storedId = localStorage.getItem('id');
        const storedFullname = localStorage.getItem('user_full_name');
        const storedPhoneno = localStorage.getItem('phone_number');
        const storedHasProfile = localStorage.getItem('has_profile') === 'true';
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
                console.log('email', email);

            }
            if (storedRole) {
                setRole(storedRole);
            }
            if (storedId) {
                setId(storedId);
            }
            if (storedPhoneno) {
                setPhone_number(storedPhoneno);
            }
            if (storedFullname) {
                setFullName(storedFullname);
            }
            if (storedHasProfile) {
                setHasProfile(storedHasProfile);
            }


            setAuthReady(true);
            setIsLoading(false);
        };

        init();
    }, []);

    const login = (access, refresh, id, email, role, user_full_name, phone_number, hasProfile) => {
        if (access) {
            const encryptedAccess = CryptoJS.AES.encrypt(access, SECRET_KEY).toString();
            Cookies.set('access_token', encryptedAccess, { expires: 1 });
            setAuthTokens({ access });
        }
        localStorage.setItem('id', id)
        localStorage.setItem('email', email);
        localStorage.setItem('role', role);
        localStorage.setItem('user_full_name', user_full_name);
        localStorage.setItem('phone_number', phone_number);
        localStorage.setItem('has_profile', hasProfile);

    };

    const logout = () => {

        setAuthTokens(null);
        setEmail(null);
        Cookies.remove('access_token');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        localStorage.removeItem('user_full_name');
        localStorage.removeItem('id');
        localStorage.removeItem('phone_number');

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
                phone_number,
                setPhone_number,
                fullName,
                setFullName,
                hasProfile,
                setHasProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
