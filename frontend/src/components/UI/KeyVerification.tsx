import { useEffect, useState } from "react";
import LabeledInput from "./LabeledInput";
import { BookManagerContract, DEFAULT_ADMIN_ROLE } from "../../constants/blockchain";
import { InputRole } from "../../constants/InputRole";


const KeyVerification = () => {
    const [adminKey, setAdminKey] = useState("");
    const [isAdminVerified, setIsAdminVerified] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem("adminKey")) {
            setIsAdminVerified(true);
        }
    }, []);

    const onVerifyAdmin = async (key: string): Promise<boolean> => {
        return await BookManagerContract.hasRole(DEFAULT_ADMIN_ROLE, key);
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
        </>
    )
}

export default KeyVerification