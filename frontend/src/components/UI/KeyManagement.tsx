import React, { useState } from 'react'
import LabeledInput from './LabeledInput';
import { ethers } from 'ethers';
import { abi } from "../../../../blockchain/artifacts/contracts/BookManager.sol/BookManager.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const KeyManager = () => {
    const [adminKey, setAdminKey] = useState("");
    const [operatorKey, setOperatorKey] = useState("");
    // const [managerKey, setManagerKey] = useState("");
    // const [userKey, setUserKey] = useState("");
    const [isAdminVerified, setIsAdminVerified] = useState(false);

    const provider = new ethers.JsonRpcProvider(`http://${window.location.hostname}:8546/`);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

    const onVerifyAdmin = async (key: string): Promise<boolean> => {
        return await contract.hasRole(DEFAULT_ADMIN_ROLE, key);
    }

    const onSubmitAdmin = () => {
        sessionStorage.setItem("adminKey", adminKey);
        setIsAdminVerified(true);
        setAdminKey("✅");
    }

    const onVerifyOperator = async (key: string): Promise<boolean> => {
        const stored = sessionStorage.getItem("operatorKeys");
        const keys: string[] = stored ? JSON.parse(stored) : [];
    
        if (keys.includes(key)) {
            return false;
        }

        const ownerAddress = sessionStorage.getItem("adminKey");
        if (!ownerAddress) {
            throw new Error("Admin key is missing");
        }

        const ownerSigner = await provider.getSigner(ownerAddress);

        try {
            await contract.connect(ownerSigner).addOperator(key);
            return true;
        }
        catch (error) {
            console.error(`An error occurred during submitting an operator: ${error}`);
            return false;
        }
    }

    const onSubmitOperator = () => {
        const stored = sessionStorage.getItem("operatorKeys");
        const keys: string[] = stored ? JSON.parse(stored) : [];

        keys.push(operatorKey);
        sessionStorage.setItem("operatorKeys", JSON.stringify(keys));
    }
    
    return (
        <>
            <LabeledInput
                label="Admin key"
                value={adminKey}
                onChange={setAdminKey}
                onSubmit={onSubmitAdmin}
                onVerify={onVerifyAdmin}
                disableOnSuccess={true}
                persistStorageKey="adminKey"
            />

            <LabeledInput
                label="Operator key"
                value={operatorKey}
                onChange={setOperatorKey}
                onSubmit={onSubmitOperator}
                onVerify={onVerifyOperator}
                disabled={!isAdminVerified}
            />
        </>
    );
};

export default KeyManager;