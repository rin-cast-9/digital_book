import { useEffect, useState } from "react";
import LabeledInput from "./LabeledInput";
import { BookManagerContract, DEFAULT_ADMIN_ROLE, OPERATOR_ROLE } from "../../constants/blockchain";
import { InputRole } from "../../constants/InputRole";
import { useAdmin } from "../../contexts/AdminContext";


const KeyVerification = () => {
    const { adminKey, setAdminKey, setIsAdminVerified, onSubmitAdmin, onRevokeAdmin } = useAdmin();
    const [operatorKey, setOperatorKey] = useState("");

    useEffect(() => {
        if (sessionStorage.getItem("adminKey")) {
            setIsAdminVerified(true);
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
        </>
    )
}

export default KeyVerification;