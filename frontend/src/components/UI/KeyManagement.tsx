import { useState } from 'react'
import LabeledInput from './LabeledInput';
import { InputRole } from '../../constants/InputRole';
import { BookManagerContract, MANAGER_ROLE, OPERATOR_ROLE, provider, USER_ROLE } from '../../constants/blockchain';
import { useAdmin } from '../../contexts/AdminContext';
import { useManager } from '../../contexts/ManagerContext';

const KeyManagement = () => {
    const [operatorKey, setOperatorKey] = useState("");
    const [userKey, setUserKey] = useState("");
    
    const { isAdminVerified } = useAdmin();
    const { isManagerVerified, managerKey, setManagerKey } = useManager();

    const onVerifyOperator = async (key: string): Promise<boolean> => {    
        return await BookManagerContract.hasRole(OPERATOR_ROLE, key);
    }

    const onSubmitOperator = async () => {
        const ownerAddress = sessionStorage.getItem("adminKey");
        if (!ownerAddress) {
            throw new Error("Admin key is missing");
        }

        const ownerSigner = await provider.getSigner(ownerAddress);

        return BookManagerContract.connect(ownerSigner).addOperator(operatorKey)
            .then(() => true)
            .catch((error: Error) => {
                console.error(`An error occurred during submitting an operator: ${error}`);
                return false;
            });
    }

    const onRevokeOperator = async () => {
        const ownerAddress = sessionStorage.getItem("adminKey");
        if (!ownerAddress) {
            throw new Error("Admin key is missing");
        }

        const ownerSigner = await provider.getSigner(ownerAddress);

        return BookManagerContract.connect(ownerSigner).revokeOperator(operatorKey)
            .then(() => true)
            .catch((error: Error) => {
                console.error(`An error occurred during revoking the operator: ${error}`);
                return false;
            });
    }

    const onVerifyManager = async (key: string): Promise<boolean> => {
        return await BookManagerContract.hasRole(MANAGER_ROLE, key);
    }

    const onSubmitManager = async () => {
        const ownerAddress = sessionStorage.getItem("adminKey");
        if (!ownerAddress) {
            throw new Error("Admin key is missing");
        }

        const ownerSigner = await provider.getSigner(ownerAddress);

        return BookManagerContract.connect(ownerSigner).addManager(managerKey)
            .then(() => true)
            .catch((error: Error) => {
                console.error(`An error occurred during submitting a manager: ${error}`);
                return false;
            });
    }

    const onRevokeManager = async () => {
        const ownerAddress = sessionStorage.getItem("adminKey");
        if (!ownerAddress) {
            throw new Error("Admin key is missing");
        }

        const ownerSigner = await provider.getSigner(ownerAddress);

        return BookManagerContract.connect(ownerSigner).revokeManager(managerKey)
            .then(() => true)
            .catch((error: Error) => {
                console.error(`An error occurred during revoking the operator: ${error}`);
                return false;
            });
    }

    const onVerifyUser = async (key: string): Promise<boolean> => {
        return await BookManagerContract.hasRole(USER_ROLE, key);
    }

    const onSubmitUser = async () => {
        const managerAddress = sessionStorage.getItem("managerKey");
        if (!managerAddress) {
            throw new Error("Manager key is missing");
        }

        const managerSigner = await provider.getSigner(managerAddress);

        return BookManagerContract.connect(managerSigner).addUser(userKey)
            .then(() => true)
            .catch((error: Error) => {
                console.error(`An error occurred during submitting a user: ${error}`);
                return false;
            });
    }

    const onRevokeUser = async () => {
        const managerAddress = sessionStorage.getItem("managerKey");
        if (!managerAddress) {
            throw new Error("Manager key is missing");
        }

        const managerSigner = await provider.getSigner(managerAddress);

        return BookManagerContract.connect(managerSigner).revokeUser(userKey)
        .then(() => true)
        .catch((error: Error) => {
            console.error(`An error occurred during revoking the user: ${error}`);
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

            <LabeledInput
                label="Manager key"
                value={managerKey}
                onChange={setManagerKey}
                onSubmit={onSubmitManager}
                onRevoke={onRevokeManager}
                onVerify={onVerifyManager}
                disabled={!isAdminVerified}
                inputRole={InputRole.MANAGER}
            />

            <LabeledInput
                label="User key"
                value={userKey}
                onChange={setUserKey}
                onSubmit={onSubmitUser}
                onRevoke={onRevokeUser}
                onVerify={onVerifyUser}
                disabled={!isManagerVerified}
                inputRole={InputRole.MANAGER}
            />
        </>
    );
};

export default KeyManagement;