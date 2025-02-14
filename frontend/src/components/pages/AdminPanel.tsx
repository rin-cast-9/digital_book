// import { ethers } from "ethers";
import { useState } from "react";
import LabeledInput from "../UI/LabeledInput";
// import { abi } from "../../artifacts/contracts/BookManager.sol/BookManager.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

// async function saveAdminKey(adminKey: string): Promise<boolean> {
//     try {
//         const isAdmin = await verifyAdminKey(adminKey);

//         if (isAdmin) {
//             sessionStorage.setItem("adminKey", adminKey);

//             return true;
//         }
//         else {
//             console.error("Not an admin");
//         }
//     }
//     catch (error) {
//         console.error("Error in admin key verification");
//     }

//     return false;
// }

// async function verifyAdminKey(adminKey: string): Promise<boolean> {
//     // const provider = new ethers.JsonRpcProvider(`http://${window.location.hostname}:8546/`);

//     // const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
//     // const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, adminKey);

//     return true;
// }

const AdminPanel = () => {
    const [adminKey, setAdminKey] = useState("");
    const [operatorKey, setOperatorKey] = useState("");
    const [managerKey, setManagerKey] = useState("");

    const onVerifyAdmin = async (key: string) => {
        if (sessionStorage.getItem("adminKey")) {
            return false;
        }
    
        return true;
    }
    
    const onVerifyOperator = async (key: string) => {
        const stored = sessionStorage.getItem("operatorKeys");
        const keys: string[] = stored ? JSON.parse(stored) : [];
    
        if (keys.includes(key)) {
            return false;
        }
    
        return true;
    }
    
    const onSubmitAdmin = () => {
        sessionStorage.setItem("adminKey", adminKey);
        setAdminKey("✅");
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
            />
        </>
    )
}

export default AdminPanel;