import { AdminProvider } from "../../contexts/AdminContext";
import { ManagerProvider } from "../../contexts/ManagerContext";
import KeyTabs from "../UI/KeyTabs";

const AdminPanel = () => {
    return (
        <>
            <AdminProvider>
                <ManagerProvider>
                    <KeyTabs />
                </ManagerProvider>
            </AdminProvider>
        </>
    )
};

export default AdminPanel;