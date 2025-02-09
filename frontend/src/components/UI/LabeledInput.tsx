import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

interface LabeledInputProps {
    label: string;
    onSubmit: (value: string) => Promise<boolean>;
}

const LabeledInput: React.FC<LabeledInputProps> = ({ label, onSubmit }) => {
    const [value, setValue] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState<string | null> (null);
    const [feedbackStyle, setFeedbackStyle] = useState<string> ("");
    const [isVerified, setIsVerified] = useState(false);

    const handleSubmit = async (inputValue: string) => {
        try {
            const isAdmin = await onSubmit(inputValue);

            if (isAdmin) {
                setFeedbackMessage("Admin key has been successfully verified.");
                setFeedbackStyle("text-success");
                setValue("✅");
                setIsVerified(true);
            }
            else {
                setFeedbackMessage("The provided key is not an Admin key.");
                setFeedbackStyle("text-danger");
            }
        }
        catch (error) {
            setFeedbackMessage("An error occurred during verification.");
            setFeedbackStyle("text-danger");
        }
    };

    return (
        <div className="mb-3 form-group">
            <label className="form-label"> {label} </label>
            <div className="input-group">
                <input 
                    className="form-control"
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={isVerified}
                />
                <button 
                    className="btn btn-primary"
                    onClick={() => handleSubmit(value)}
                    disabled={isVerified}
                >
                    Submit
                </button>
            </div>
            <div className="text-start" style={{ minHeight: "1.5rem" }}>
                {feedbackMessage && (
                    <small className={feedbackStyle}>
                        {feedbackMessage}
                    </small>
                )}
            </div>
        </div>
    );
};

export default LabeledInput;