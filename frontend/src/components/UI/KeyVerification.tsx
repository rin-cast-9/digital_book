import { useEffect, useState } from "react";
import LabeledSubmitRevokeInput from "./LabeledSubmitRevokeInput";
import { BookManagerContract, DEFAULT_ADMIN_ROLE, MANAGER_ROLE, OPERATOR_ROLE, USER_ROLE } from "../../constants/blockchain";
import { isAddress } from "ethers";


const KeyVerification = () => {
    const [adminKey, setAdminKey] = useState("");
    const [operatorKey, setOperatorKey] = useState("");
    const [managerKey, setManagerKey] = useState("");
    const [userKey, setUserKey] = useState("");

    const storeSuccessMessage = "The key was successfully stored.";
    const storeFailMessage = "The key doesn't exist.";
    const removeSuccessMessage = "The key was successfully removed.";
    const removeFailMessage = "There's no such key in the storage.";

    const submitButtonText = "Store";
    const revokeButtonText = "Remove";

    const [isRestoredAdmin, setIsRestoredAdmin] = useState(false);
    const [isRestoredOperator, setIsRestoredOperator] = useState(false);
    const [isRestoredManager, setIsRestoredManager] = useState(false);
    const [isRestoredUser, setIsRestoredUser] = useState(false);

    useEffect(() => {
        const restoredAdminKey = sessionStorage.getItem("adminKey");
        const restoredOperatorKey = sessionStorage.getItem("operatorKey");
        const restoredManagerKey = sessionStorage.getItem("managerKey");
        const restoredUserKey = sessionStorage.getItem("userKey");

        if (restoredAdminKey) {
            setAdminKey(restoredAdminKey);
            setIsRestoredAdmin(true);
        }

        if (restoredOperatorKey) {
            setOperatorKey(restoredOperatorKey);
            setIsRestoredOperator(true);
        }

        if (restoredManagerKey) {
            setManagerKey(restoredManagerKey);
            setIsRestoredManager(true);
        }

        if (restoredUserKey) {
            setUserKey(restoredUserKey);
            setIsRestoredUser(true);
        }
    }, []);

    const verifyKey = (key: string) => {
        if (!isAddress(key)) {
            throw new Error("Invalid etherium address");
        }
    }

    const onStoreAdminKey = async (): Promise<boolean> => {
        verifyKey(adminKey);

        const has = await BookManagerContract.hasRole(DEFAULT_ADMIN_ROLE, adminKey);

        if (has) {
            sessionStorage.setItem("adminKey", adminKey);
        }

        return has;
    };

    const onRemoveAdminKey = async (): Promise<boolean> => {
        const storedKey = sessionStorage.getItem("adminKey");

        if (storedKey === adminKey) {
            sessionStorage.removeItem("adminKey");
            return true;
        }
        else {
            return false;
        }
    };

    const onStoreOperatorKey = async (): Promise<boolean> => {
        verifyKey(operatorKey);

        const has = await BookManagerContract.hasRole(OPERATOR_ROLE, operatorKey);

        if (has) {
            sessionStorage.setItem("operatorKey", operatorKey);
        }

        return has;
    };

    const onRemoveOperatorKey = async (): Promise<boolean> => {
        const storedKey = sessionStorage.getItem("operatorKey");

        if (storedKey === operatorKey) {
            sessionStorage.removeItem("operatorKey");
            return true;
        }
        else {
            return false;
        }
    };

    const onStoreManagerKey = async (): Promise<boolean> => {
        verifyKey(managerKey);

        const has = await BookManagerContract.hasRole(MANAGER_ROLE, managerKey);

        if (has) {
            sessionStorage.setItem("managerKey", managerKey);
        }

        return has;
    };

    const onRemoveManagerKey = async (): Promise<boolean> => {
        const storedKey = sessionStorage.getItem("managerKey");

        if (storedKey === managerKey) {
            sessionStorage.removeItem("managerKey");
            return true;
        }
        else {
            return false;
        }
    };

    const onStoreUserKey = async (): Promise<boolean> => {
        verifyKey(userKey);

        const has = await BookManagerContract.hasRole(USER_ROLE, userKey);

        if (has) {
            sessionStorage.setItem("userKey", userKey);
        }

        return has;
    };

    const onRemoveUserKey = async (): Promise<boolean> => {
        const storedKey = sessionStorage.getItem("userKey");

        if (storedKey === userKey) {
            sessionStorage.removeItem("userKey");
            return true;
        }
        else { 
            return false;
        }
    }

    return (
        <>
            <LabeledSubmitRevokeInput
                label="Admin key"
                value={adminKey}
                onChange={setAdminKey}
                onSubmit={onStoreAdminKey}
                onRevoke={onRemoveAdminKey}
                disabled={false}
                disableOnSuccess={true}
                isRestoredFromStorage={isRestoredAdmin}
                submitSuccessMessage={storeSuccessMessage}
                submitFailMessage={storeFailMessage}
                revokeSuccessMessage={removeSuccessMessage}
                revokeFailMessage={removeFailMessage}
                submitButtonText={submitButtonText}
                revokeButtonText={revokeButtonText}
            />

            <LabeledSubmitRevokeInput
                label="Operator key"
                value={operatorKey}
                onChange={setOperatorKey}
                onSubmit={onStoreOperatorKey}
                onRevoke={onRemoveOperatorKey}
                disabled={false}
                disableOnSuccess={true}
                isRestoredFromStorage={isRestoredOperator}
                submitSuccessMessage={storeSuccessMessage}
                submitFailMessage={storeFailMessage}
                revokeSuccessMessage={removeSuccessMessage}
                revokeFailMessage={removeFailMessage}
                submitButtonText={submitButtonText}
                revokeButtonText={revokeButtonText}
            />

            <LabeledSubmitRevokeInput
                label="Manager key"
                value={managerKey}
                onChange={setManagerKey}
                onSubmit={onStoreManagerKey}
                onRevoke={onRemoveManagerKey}
                disabled={false}
                disableOnSuccess={true}
                isRestoredFromStorage={isRestoredManager}
                submitSuccessMessage={storeSuccessMessage}
                submitFailMessage={storeFailMessage}
                revokeSuccessMessage={removeSuccessMessage}
                revokeFailMessage={removeFailMessage}
                submitButtonText={submitButtonText}
                revokeButtonText={revokeButtonText}
            />

            <LabeledSubmitRevokeInput
                label="User key"
                value={userKey}
                onChange={setUserKey}
                onSubmit={onStoreUserKey}
                onRevoke={onRemoveUserKey}
                disabled={false}
                disableOnSuccess={true}
                isRestoredFromStorage={isRestoredUser}
                submitSuccessMessage={storeSuccessMessage}
                submitFailMessage={storeFailMessage}
                revokeSuccessMessage={removeSuccessMessage}
                revokeFailMessage={removeFailMessage}
                submitButtonText={submitButtonText}
                revokeButtonText={revokeButtonText}
            />
        </>
    )
}

export default KeyVerification;