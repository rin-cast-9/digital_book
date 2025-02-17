import { AdminProvider } from "../../contexts/AdminContext";
import KeyTabs from "../UI/KeyTabs";

const AdminPanel = () => {
    return (
        <>
            <AdminProvider>
                <KeyTabs />
            </AdminProvider>
        </>
    )
};

export default AdminPanel;