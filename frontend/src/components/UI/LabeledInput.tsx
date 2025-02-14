import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';

interface LabeledInputProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    onSubmit: () => void;
    onVerify: (value: string) => Promise<boolean>;
    disabled?: boolean;
    disableOnSuccess?: boolean;
    persistStorageKey?: string;
}

const LabeledInput: React.FC<LabeledInputProps> = ({
    label,
    value,
    onChange,
    onSubmit,
    onVerify,
    disabled = false,
    disableOnSuccess = false,
    persistStorageKey,
}) => {

    const [feedback, setFeedback] = useState({ message: "", style: "" });
    const [isDisabled, setIsDisabled] = useState(false);

    useEffect(() => {
        if (persistStorageKey) {
            const stored = sessionStorage.getItem(persistStorageKey);

            if (stored) {
                setIsDisabled(true);
                onChange(stored);
                setFeedback({ message: "Key verified from session.", style: "text-success" });
            }
        }
    }, [persistStorageKey, onChange]);

    const handleSubmit = async () => {
        try {
            const valid = await onVerify(value);

            if (valid) {
                setFeedback({ message: "Key successfully verified.", style: "text-success" });
                if (disableOnSuccess) {
                    setIsDisabled(true);
                }
                onSubmit();
            }
            else {
                setFeedback({ message: "The provided key is not valid.", style: "text-danger" });
            }
        }
        catch {
            setFeedback({ message: "An error occurred during verification", style: "text-danger" });
        }
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
                    Submit
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