import React, { createContext, ReactNode, useContext, useState } from "react";


interface ManagerContextType {
    managerKey: string;
    setManagerKey: React.Dispatch<React.SetStateAction<string>>;
    isManagerVerified: boolean;
    setIsManagerVerified: React.Dispatch<React.SetStateAction<boolean>>;
    onSubmitManager: () => void;
    onRevokeManager: () => void;
}

interface ManagerProviderProps {
    children: ReactNode
}

const ManagerContext = createContext <ManagerContextType | null> (null);

export const ManagerProvider = ({ children }: ManagerProviderProps) => {
    const [managerKey, setManagerKey] = useState(
        sessionStorage.getItem("managerKey") || ""
    );
    const [isManagerVerified, setIsManagerVerified] = useState(
        !!sessionStorage.getItem("managerKey")
    );

    const onSubmitManager = () => {
        sessionStorage.setItem("managerKey", managerKey);
        setIsManagerVerified(true);
    }

    const onRevokeManager = () => {
        sessionStorage.removeItem("managerKey");
        setIsManagerVerified(false);
        setManagerKey("");
    };

    return (
        <ManagerContext.Provider
            value={{ managerKey, setManagerKey, isManagerVerified, setIsManagerVerified, onSubmitManager, onRevokeManager }}
        >
            { children }
        </ManagerContext.Provider>
    );
};

export const useManager = () => {
    const context = useContext(ManagerContext);
    if (!context) {
        throw new Error("useManager must be used within ManagerProvider");
    }

    return context;
};