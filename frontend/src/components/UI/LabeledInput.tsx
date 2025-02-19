import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { InputRole } from "../../constants/InputRole";

interface LabeledInputProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    onSubmit: () => void;
    onRevoke: () => void;
    onVerify: (value: string) => Promise<boolean>;
    disabled?: boolean;
    disableOnSuccess?: boolean;
    persistStorageKey?: string;
    inputRole: InputRole
}

const LabeledInput: React.FC<LabeledInputProps> = ({
    label,
    value,
    onChange,
    onSubmit,
    onRevoke,
    onVerify,
    disabled = false,
    disableOnSuccess = false,
    persistStorageKey,
    inputRole
}) => {

    const [feedback, setFeedback] = useState({ message: "", style: "" });
    const [isDisabled, setIsDisabled] = useState(false);

    const isManager = (inputRole === InputRole.MANAGER) ? true : false;

    useEffect(() => {
        if (persistStorageKey) {
            const stored = sessionStorage.getItem(persistStorageKey);

            if (stored) {
                setIsDisabled(true);
                onChange(stored);

                setFeedback({ message: "The key has been verified from session.", style: "text-success" });
            }
            else {
                setIsDisabled(false);
            }
        }
    }, [persistStorageKey, onChange, value]);

    const handleSubmit = () => {
        onVerify(value)
            .then((exists: boolean) => {
                const valid = (exists === isManager) ? false : true; // isManager XOR exists
                if (valid) {
                    if (isManager) {
                        setFeedback({ message: "The key has been successfully registered.", style: "text-success" });
                    }
                    else {
                        setFeedback({ message: "The key has been successfully stored.", style: "text-success" });
                    }

                    onSubmit();
                    if (disableOnSuccess) {
                        setIsDisabled(true);
                    }
                }
                else {
                    if (isManager) {
                        setFeedback({ message: "The provided key is already registered.", style: "text-danger" });
                    }
                    else {
                        setFeedback({ message: "The provided key doesn't exist.", style: "text-danger" });
                    }
                }
            })
            .catch(() => {
                setFeedback({ message: "An error occurred during verification", style: "text-danger" });
            });
    };

    const handleRevoke = async () => {
        onVerify(value)
            .then((valid: boolean) => {
                if (valid) {
                    if (isManager) {
                        setFeedback({ message: "The key has been successfully revoked.", style: "text-info" });
                    }
                    else {
                        setFeedback({ message: "The key has been successfully removed.", style: "text-info" });
                    }

                    onRevoke();
                    if (disableOnSuccess) {
                        setIsDisabled(false);
                    }
                }
                else {
                    if (isManager) {
                        setFeedback({ message: "The key is not assigend to the role.", style: "text-danger" });
                    }
                    else {
                        setFeedback({ message: "The key is not found in the storage.", style: "text-danger" });
                    }
                }
            })
            .catch(() => {
                setFeedback({ message: "An error occurred during revokation.", style: "text-danger" });
            })
    };

    return (
        <div className="mb-3 form-group">
            <label className="form-label"> {label} </label>
            <div className="input-group">
                <input 
                    type="text"
                    className="form-control"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled || isDisabled}
                />
                <button 
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={disabled || isDisabled}
                >
                    {inputRole === InputRole.MANAGER ? "Submit" : "Store"}
                </button>
                <button 
                    className="btn btn-outline-danger"
                    onClick={handleRevoke}
                    disabled={disabled || !Boolean(value)}
                >
                    {inputRole === InputRole.MANAGER ? "Revoke" : "Remove"}
                </button>
            </div>
            <div className="text-start" style={{ minHeight: "1.5rem" }}>
                {
                    feedback.message &&
                    <small className={feedback.style}>
                        {feedback.message}
                    </small>
                }
            </div>
        </div>
    );
};

export default LabeledInput;