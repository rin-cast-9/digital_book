import { useState } from 'react'
import LabeledSubmitRevokeInput from './LabeledSubmitRevokeInput';
import { BookManagerContract, provider } from '../../constants/blockchain';
import { Wallet } from 'ethers';

const KeyManagement = () => {
    const [operatorKey, setOperatorKey] = useState("");
    const [managerKey, setManagerKey] = useState("");
    const [userKey, setUserKey] = useState("");

    const submitSuccessMessage = "The key was successfully submitted.";
    const submitFailMessage = "The key has been already registered before.";
    const revokeSuccessMessage = "The key has been successfully revoked.";
    const revokeFailMessage = "The key is not assigned to the role.";

    const submitButtonText = "Submit";
    const revokeButtonText = "Revoke";

    const getOwnerSigner = (sessionStorageKey: string): Wallet => {
        const key = sessionStorage.getItem(sessionStorageKey);

        if (!key) {
            throw new Error("Insufficient authority to perform the operation");
        }

        return new Wallet(key, provider);
    }

    const onSubmitOperatorKey = async (): Promise<boolean> => {
        const ownerSigner = getOwnerSigner("adminKey");

        try {
            const wallet = new Wallet(operatorKey);
            const address = wallet.address;

            const tx = await BookManagerContract
                .connect(ownerSigner)
                .addOperator(address);
                
            const receipt = await tx.wait();

            return receipt.status === 1;
        }
        catch (error) {
            console.error(`Error adding operator: ${error}`);
            return false;
        }
    }

    const onRevokeOperatorKey = async (): Promise<boolean> => {
        const ownerSigner = getOwnerSigner("adminKey");

        try {
            const wallet = new Wallet(operatorKey);
            const address = wallet.address;

            const tx = await BookManagerContract
                .connect(ownerSigner)
                .revokeOperator(address);

            const receipt = await tx.wait();

            const status = receipt.status === 1;

            if (status && sessionStorage.getItem("operatorKey") === operatorKey) {
                sessionStorage.removeItem("operatorKey");
            }

            return status;
        }
        catch (error) {
            console.error(`Error revoking operator: ${error}`);
            return false;
        }
    }

    const onSubmitManagerKey = async (): Promise<boolean> => {
        const ownerSigner = getOwnerSigner("adminKey");

        try {
            const wallet = new Wallet(managerKey);
            const address = wallet.address;

            const tx = await BookManagerContract
                .connect(ownerSigner)
                .addManager(address);
            
            const receipt = await tx.wait();

            return receipt.status === 1;
        }
        catch (error) {
            console.error(`Error adding manager: ${error}`);
            return false;
        }
    }

    const onRevokeManagerKey = async (): Promise<boolean> => {
        const ownerSigner = getOwnerSigner("adminKey");

        try {
            const wallet = new Wallet(managerKey);
            const address = wallet.address;

            const tx = await BookManagerContract
                .connect(ownerSigner)
                .revokeManager(address);

            const receipt = await tx.wait();

            const status = receipt.status === 1;

            if (status && sessionStorage.getItem("managerKey")) {
                sessionStorage.removeItem("managerKey");
            }

            return status;
        }
        catch (error) {
            console.error(`Error revoking manager: ${error}`);
            return false;
        }
    }

    const onSubmitUserKey = async (): Promise<boolean> => {
        const ownerSigner = getOwnerSigner("managerKey");

        try {
            const wallet = new Wallet(userKey);
            const address = wallet.address;

            const tx = await BookManagerContract
                .connect(ownerSigner)
                .addUser(address);

            const receipt = await tx.wait();

            return receipt.status === 1;
        }
        catch (error) {
            console.error(`Error adding user: ${error}`);
            return false;
        }
    }

    const onRevokeUserKey = async (): Promise<boolean> => {
        const ownerSigner = getOwnerSigner("managerKey");

        try {
            const wallet = new Wallet(operatorKey);
            const address = wallet.address;
            
            const tx = await BookManagerContract
                .connect(ownerSigner)
                .revokeUser(userKey);

            const receipt = await tx.wait();

            const status = receipt.status === 1;

            if (status && sessionStorage.getItem("userKey")) {
                sessionStorage.removeItem("userKey");
            }

            return status;
        }
        catch (error) {
            console.error(`Error revoking user: ${error}`);
            return false;
        }
    }
    
    return (
        <>
            <LabeledSubmitRevokeInput
                label="Operator key"
                value={operatorKey}
                onChange={setOperatorKey}
                onSubmit={onSubmitOperatorKey}
                onRevoke={onRevokeOperatorKey}
                disabled={!sessionStorage.getItem("adminKey")?.trim()}
                disableOnSuccess={false}
                isRestoredFromStorage={false}
                submitSuccessMessage={submitSuccessMessage}
                submitFailMessage={submitFailMessage}
                revokeSuccessMessage={revokeSuccessMessage}
                revokeFailMessage={revokeFailMessage}
                submitButtonText={submitButtonText}
                revokeButtonText={revokeButtonText}
            />

            <LabeledSubmitRevokeInput
                label="Manager key"
                value={managerKey}
                onChange={setManagerKey}
                onSubmit={onSubmitManagerKey}
                onRevoke={onRevokeManagerKey}
                disabled={!sessionStorage.getItem("adminKey")?.trim()}
                disableOnSuccess={false}
                isRestoredFromStorage={false}
                submitSuccessMessage={submitSuccessMessage}
                submitFailMessage={submitFailMessage}
                revokeSuccessMessage={revokeSuccessMessage}
                revokeFailMessage={revokeFailMessage}
                submitButtonText={submitButtonText}
                revokeButtonText={revokeButtonText}
            />

            <LabeledSubmitRevokeInput
                label="User key"
                value={userKey}
                onChange={setUserKey}
                onSubmit={onSubmitUserKey}
                onRevoke={onRevokeUserKey}
                disabled={!sessionStorage.getItem("managerKey")?.trim()}
                disableOnSuccess={false}
                isRestoredFromStorage={false}
                submitSuccessMessage={submitSuccessMessage}
                submitFailMessage={submitFailMessage}
                revokeSuccessMessage={revokeSuccessMessage}
                revokeFailMessage={revokeFailMessage}
                submitButtonText={submitButtonText}
                revokeButtonText={revokeButtonText}
            />
        </>
    );
};

export default KeyManagement;