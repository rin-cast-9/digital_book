import { useEffect, useState } from 'react'
import LabeledInput from './LabeledInput';
import { InputRole } from '../../constants/InputRole';
import { BookManagerContract, OPERATOR_ROLE, provider } from '../../constants/blockchain';
import { useAdmin } from '../../contexts/AdminContext';

const KeyManagement = () => {
    const [operatorKey, setOperatorKey] = useState("");
    
    const { isAdminVerified } = useAdmin();

    const onVerifyOperator = async (key: string): Promise<boolean> => {    
        return await BookManagerContract.hasRole(OPERATOR_ROLE, key);
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

        return BookManagerContract.connect(ownerSigner).addOperator(operatorKey)
            .then(() => {
                keys.push(operatorKey);
                sessionStorage.setItem("operatorKeys", JSON.stringify(keys));
                console.log(`the key ${operatorKey} has been added to the blockchain.`);
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

        return BookManagerContract.connect(ownerSigner).revokeOperator(operatorKey)
            .then(() => {
                const updatedKeys = keys.filter(key => key !== operatorKey);
                sessionStorage.setItem("operatorKeys", JSON.stringify(updatedKeys));
                console.log(`the key ${operatorKey} has been removed from the blockchain.`);
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
                label="Operator key"
                value={operatorKey}
                onChange={setOperatorKey}
                onSubmit={onSubmitOperator}
                onRevoke={onRevokeOperator}
                onVerify={onVerifyOperator}
                disabled={!isAdminVerified}
                inputRole={InputRole.MANAGER}
            />
        </>
    );
};

export default KeyManagement;