import { createContext, ReactNode, useContext, useState } from "react";


interface AdminContextType {
    adminKey: string;
    setAdminKey: React.Dispatch<React.SetStateAction<string>>;
    isAdminVerified: boolean;
    setIsAdminVerified: React.Dispatch<React.SetStateAction<boolean>>;
    onSubmitAdmin: () => void;
    onRevokeAdmin: () => void;
}

interface AdminProviderProps {
    children: ReactNode;
}

const AdminContext = createContext <AdminContextType | null> (null);

export const AdminProvider = ({ children }: AdminProviderProps) => {
    const [adminKey, setAdminKey] = useState(
        sessionStorage.getItem("adminKey") || ""
    );
    const [isAdminVerified, setIsAdminVerified] = useState(
        !!sessionStorage.getItem("adminKey")
    );

    const onSubmitAdmin = () => {
        sessionStorage.setItem("adminKey", adminKey);
        setIsAdminVerified(true);
    };

    const onRevokeAdmin = () => {
        sessionStorage.removeItem("adminKey");
        setIsAdminVerified(false);
        setAdminKey("");
    };

    return (
        <AdminContext.Provider
            value={{ adminKey, setAdminKey, isAdminVerified, setIsAdminVerified, onSubmitAdmin, onRevokeAdmin }}
        >
            { children }
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdmin must be used within AdminProvider");
    }
    return context;
};