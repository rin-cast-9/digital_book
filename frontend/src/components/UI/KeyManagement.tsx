import { useEffect, useState } from 'react'
import LabeledInput from './LabeledInput';
import { ethers } from 'ethers';
import { abi } from "../../../../blockchain/artifacts/contracts/BookManager.sol/BookManager.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const OPERATOR_ROLE = "0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929";
const MANAGER_ROLE = "0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08";
const USER_ROLE = "0x14823911f2da1b49f045a0929a60b8c1f2a7fc8c06c7284ca3e8ab4e193a08c8";

const KeyManagement = () => {
    const [adminKey, setAdminKey] = useState("");
    const [operatorKey, setOperatorKey] = useState("");
    const [managerKey, setManagerKey] = useState("");
    const [userKey, setUserKey] = useState("");
    const [isAdminVerified, setIsAdminVerified] = useState(false);

    const provider = new ethers.JsonRpcProvider(`http://${window.location.hostname}:8546/`);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

    useEffect(() => {
        if (sessionStorage.getItem("adminKey")) {
            setIsAdminVerified(true);
        }
    }, []);

    const onVerifyAdmin = async (key: string): Promise<boolean> => {
        return await contract.hasRole(DEFAULT_ADMIN_ROLE, key);
    }

    const onSubmitAdmin = () => {
        sessionStorage.setItem("adminKey", adminKey);
        setIsAdminVerified(true);
    }

    const onRevokeAdmin = () => {
        sessionStorage.removeItem("adminKey");
        setIsAdminVerified(false);
        setAdminKey("");
    }

    const onVerifyOperator = async (key: string): Promise<boolean> => {    
        return await contract.hasRole(OPERATOR_ROLE, key);
    }

    const onSubmitOperator = async () => {
        const stored = sessionStorage.getItem("operatorKeys");
        const keys: string[] = stored ? JSON.parse(stored) : [];

        if (keys.includes(operatorKey)) {
            return false;
        }

        const ownerAddress = sessionStorage.getItem("adminKey");
        if (!ownerAddress) {
            throw new Error("Admin key is missing");
        }

        const ownerSigner = await provider.getSigner(ownerAddress);

        return contract.connect(ownerSigner).addOperator(operatorKey)
            .then(() => {
                keys.push(operatorKey);
                sessionStorage.setItem("operatorKeys", JSON.stringify(keys));
                return true;
            })
            .catch((error: Error) => {
                console.error(`An error occurred during submitting an operator: ${error}`);
                return false;
            });
    }

    const onRevokeOperator = async () => {
        const stored = sessionStorage.getItem("operatorKeys");
        const keys: string[] = stored ? JSON.parse(stored) : [];

        if (!keys.includes(operatorKey)) {
            return false;
        }

        const ownerAddress = sessionStorage.getItem("adminKey");
        if (!ownerAddress) {
            throw new Error("Admin key is missing");
        }

        const ownerSigner = await provider.getSigner(ownerAddress);

        return contract.connect(ownerSigner).revokeOperator(operatorKey)
            .then(() => {
                const updatedKeys = keys.filter(key => key !== operatorKey);
                sessionStorage.setItem("operatorKeys", JSON.stringify(updatedKeys));
                return true;
            })
            .catch((error: Error) => {
                console.error(`An error occurred during revoking the operator: ${error}`);
                return false;
            });
    }
    
    return (
        <>
            <LabeledInput
                label="Admin key"
                value={adminKey}
                onChange={setAdminKey}
                onSubmit={onSubmitAdmin}
                onRevoke={onRevokeAdmin}
                onVerify={onVerifyAdmin}
                disableOnSuccess={true}
                persistStorageKey="adminKey"
            />

            <LabeledInput
                label="Operator key"
                value={operatorKey}
                onChange={setOperatorKey}
                onSubmit={onSubmitOperator}
                onRevoke={onRevokeOperator}
                onVerify={onVerifyOperator}
                disabled={!isAdminVerified}
            />
        </>
    );
};

export default KeyManagement;