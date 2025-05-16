import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';

interface LabeledSubmitRevokeInputProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    onSubmit: () => Promise<boolean>;
    onRevoke: () => Promise<boolean>;
    disabled?: boolean;
    disableOnSuccess?: boolean;
    isRestoredFromStorage: boolean;
    submitSuccessMessage: string;
    submitFailMessage: string;
    revokeSuccessMessage: string;
    revokeFailMessage: string;
    submitButtonText: string;
    revokeButtonText: string;
}

const LabeledSubmitRevokeInput: React.FC<LabeledSubmitRevokeInputProps> = ({
    label,
    value,
    onChange,
    onSubmit,
    onRevoke,
    disabled = false,
    disableOnSuccess = false,
    isRestoredFromStorage,
    submitSuccessMessage,
    submitFailMessage,
    revokeSuccessMessage,
    revokeFailMessage,
    submitButtonText,
    revokeButtonText,
}) => {
    const [feedback, setFeedback] = useState({ message: "", style: "" });
    const [submitSucceeded, setSubmitSucceeded] = useState(false);
    const [revokeSucceeded, setRevokeSucceeded] = useState(false);

    const illFormedKeyMessage = "The provided key is either ill formed or you have insufficient authority.";

    useEffect(() => {
        if (isRestoredFromStorage) {
            setSubmitSucceeded(true);
            setFeedback({ message: "The key was retrieved from the storage.", style: "text-info"});
        }
    }, [isRestoredFromStorage]);

    const handleSubmit = async () => {
        try {
            if (await onSubmit()) {
                setFeedback({ message: submitSuccessMessage, style: "text-success" });
                setSubmitSucceeded(true);
                setRevokeSucceeded(false);
            }
            else {
                setFeedback({ message: submitFailMessage, style: "text-danger" });
            }
        }
        catch(error: any) {
            console.log(error.message);
            setFeedback({ message: illFormedKeyMessage, style: "text-danger "});
        }
    };

    const handleRevoke = async () => {
        try {
            if (await onRevoke()) {
                setFeedback({ message: revokeSuccessMessage, style: "text-info" });
                setRevokeSucceeded(true);
                setSubmitSucceeded(false);
            }
            else {
                setFeedback({ message: revokeFailMessage, style: "text-danger" });
            }
        }
        catch {
            setFeedback({ message: illFormedKeyMessage, style: "text-danger" });
        }
    }

    const isSubmitDisabled = disabled || (disableOnSuccess && submitSucceeded);

    const isRevokeDisabled = disabled || value.trim() === "" || (disableOnSuccess && revokeSucceeded)

    return (
        <div className="mb-3 form-group">
            <label className="form-label"> {label} </label>
            <div className="input-group">
                <input
                    type="text"
                    className="form-control"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={isSubmitDisabled}
                />
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                >
                    {submitButtonText}
                </button>
                <button
                    className="btn btn-outline-danger"
                    onClick={handleRevoke}
                    disabled={isRevokeDisabled}
                >
                    {revokeButtonText}
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

export default LabeledSubmitRevokeInput;
