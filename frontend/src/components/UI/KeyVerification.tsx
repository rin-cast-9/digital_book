import { useEffect, useState } from "react";
import LabeledInput from "./LabeledInput";
import { BookManagerContract, DEFAULT_ADMIN_ROLE, MANAGER_ROLE, OPERATOR_ROLE, USER_ROLE } from "../../constants/blockchain";
import { InputRole } from "../../constants/InputRole";
import { useAdmin } from "../../contexts/AdminContext";
import { useManager } from "../../contexts/ManagerContext";


const KeyVerification = () => {
    const { adminKey, setAdminKey, setIsAdminVerified, onSubmitAdmin, onRevokeAdmin } = useAdmin();
    const { managerKey, setManagerKey, setIsManagerVerified, onSubmitManager, onRevokeManager } = useManager();
    const [operatorKey, setOperatorKey] = useState("");
    const [userKey, setUserKey] = useState("");

    useEffect(() => {
        if (sessionStorage.getItem("adminKey")) {
            setIsAdminVerified(true);
        }
        else {
            setIsAdminVerified(false);
        }

        if (sessionStorage.getItem("managerKey")) {
            setIsManagerVerified(true);
        }
        else {
            setIsManagerVerified(false);
        }
    }, []);

    const onVerifyAdmin = async (key: string): Promise<boolean> => {
        return await BookManagerContract.hasRole(DEFAULT_ADMIN_ROLE, key);
    }

    const onSubmitOperator = () => {
        sessionStorage.setItem("operatorKey", operatorKey);
    };

    const onRevokeOperator = () => {
        sessionStorage.removeItem("operatorKey");
        setOperatorKey("");
    };

    const onVerifyOperator = async (key: string) => {
        return await BookManagerContract.hasRole(OPERATOR_ROLE, key);
    }
    
    const onVerifyManager = async (key: string) => {
        return await BookManagerContract.hasRole(MANAGER_ROLE, key);
    }

    const onSubmitUser = () => {
        sessionStorage.setItem("userKey", userKey);
    }

    const onRevokeUser = () => {
        sessionStorage.removeItem("userKey");
        setUserKey("");
    }

    const onVerifyUser = async (key: string) => {
        return await BookManagerContract.hasRole(USER_ROLE, key);
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
                inputRole={InputRole.VERIFIER}
            />

            <LabeledInput
                label="Operator key"
                value={operatorKey}
                onChange={setOperatorKey}
                onSubmit={onSubmitOperator}
                onRevoke={onRevokeOperator}
                onVerify={onVerifyOperator}
                disableOnSuccess={true}
                persistStorageKey="operatorKey"
                inputRole={InputRole.VERIFIER}
            />

            <LabeledInput
                label="Manager key"
                value={managerKey}
                onChange={setManagerKey}
                onSubmit={onSubmitManager}
                onRevoke={onRevokeManager}
                onVerify={onVerifyManager}
                disableOnSuccess={true}
                persistStorageKey="managerKey"
                inputRole={InputRole.VERIFIER}
            />

            <LabeledInput
                label="User key"
                value={userKey}
                onChange={setUserKey}
                onSubmit={onSubmitUser}
                onRevoke={onRevokeUser}
                onVerify={onVerifyUser}
                disableOnSuccess={true}
                persistStorageKey="userKey"
                inputRole={InputRole.VERIFIER}
            />
        </>
    )
}

export default KeyVerification;