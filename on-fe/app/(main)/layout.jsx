import { AuthProvider } from "@/contexts/AuthProvider";

export default function MainLayout({ children }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
