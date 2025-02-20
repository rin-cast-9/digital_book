import React from "react";

interface AuthorsInputProps {
    authors: string[];
    setAuthors: React.Dispatch<React.SetStateAction<string[]>>;
}


const AuthorsInput: React.FC<AuthorsInputProps> = ({
    authors,
    setAuthors
}) => {
    const handleChange = (index: number, value: string) => {
        const updated = [...authors];
        updated[index] = value;
        
        if (index === authors.length - 1 && value.trim() !== "") {
            updated.push("");
        }

        setAuthors(updated);
    }

    const handleBlur = (index: number, value: string) => {
        if (value.trim() === "" && authors.length > 1) {
            const updated =authors.filter((_, idx) => idx !== index);
            setAuthors(updated);
        }
    }

    return (
        <>
            <label
                htmlFor="inputAuthors"
                className="form-label"
            >
                Authors: {authors.length}
            </label>
            {authors.map((author, i) => (
                <input
                    key={i}
                    type="text"
                    className="form-control list-group-item my-1"
                    id="inputAuthors"
                    placeholder="Author"
                    value={author}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onBlur={(e) => handleBlur(i, e.target.value)}
                />
            ))}
        </>
    );
};

export default AuthorsInput;