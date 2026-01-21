import { AuthProvider } from "@/contexts/AuthContext";

export default function MainLayout({ children }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
