"use client";
import { GoogleOAuthProvider } from '@react-oauth/google';

export function Providers({ children }) {
    return (
        <GoogleOAuthProvider clientId="900126587995-1mjuvekvgrpp4j6ulb5mh2moctcgn0f5.apps.googleusercontent.com">
            {children}
        </GoogleOAuthProvider>
    );
}
