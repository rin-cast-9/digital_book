import { ethers } from "ethers";
import LabeledInput from "../UI/LabeledInput";
import { abi } from "../../artifacts/contracts/BookManager.sol/BookManager.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

async function saveAdminKey(adminKey: string): Promise<boolean> {
    try {
        const isAdmin = await verifyAdminKey(adminKey);

        if (isAdmin) {
            sessionStorage.setItem("adminKey", adminKey);

            return true;
        }
        else {
            console.error("Not an admin");
        }
    }
    catch (error) {
        console.error("Error in admin key verification");
    }

    return false;
}

async function verifyAdminKey(adminKey: string): Promise<boolean> {
    const provider = new ethers.JsonRpcProvider("http://localhost:8546/");

    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
    const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, adminKey);

    return isAdmin;
}

const AdminPanel = () => {
    return (
        <>
            <LabeledInput label="Admin key" onSubmit={saveAdminKey} />
        </>
    )
}

export default AdminPanel;