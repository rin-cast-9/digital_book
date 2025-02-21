import { useState } from "react";
import AuthorsInput from "../UI/AuthorsInput"
import { BookManagerContract, provider } from "../../constants/blockchain";


const AddBook = () => {
    const [title, setTitle] = useState("");
    const [publisher, setPublisher] = useState("");
    const [publisherCity, setPublisherCity] = useState("");
    const [yearPublished, setYearPublished] = useState<number>();
    const [authors, setAuthors] = useState<string[]>([""]);

    const handleSubmit = async () => {
        const omittedLastEmptyAuthors = authors.slice(0, -1);

        const operatorAddress = sessionStorage.getItem("operatorKey");
        if (!operatorAddress) {
            throw new Error("Unauthorized access");
        }

        const operatorSigner = await provider.getSigner(operatorAddress);
        
        /**
         * uint16 _yearPublished,
         * string memory _name,
         * string memory _publisher,
         * string memory _publisherCity,
         * string[] memory _authors
         */
        return BookManagerContract.connect(operatorSigner).addBook(
            yearPublished,
            title,
            publisher,
            publisherCity,
            omittedLastEmptyAuthors
        ).then(() => { })
        .catch((error: Error) => {
            console.error(`An error occurred during book submision: ${error}`);
        })
    }

    return (
        <>
            <h2 className="mb-3">
                Book
            </h2>
            <button
                className="btn btn-outline-primary mb-4"
                onClick={handleSubmit}
            >
                Submit
            </button>
            <div className="sticky-top" style={{ minHeight: "600px" }}>
                <div className="form-group">
                    <div className="mb-3">
                        <label
                            htmlFor="inputTitle"
                            className="form-label"
                        >
                            Title
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="inputTitle"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label
                            htmlFor="inputPublisher"
                            className="form-label"
                        >
                            Publisher
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="inputPublisher"
                            placeholder="Publisher"
                            value={publisher}
                            onChange={(e) => setPublisher(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label
                            htmlFor="inputPublisherCity"
                            className="form-label"
                        >
                            Publisher city
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="inputPublisherCity"
                            placeholder="Publisher city"
                            value={publisherCity}
                            onChange={(e) => setPublisherCity(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label
                            htmlFor="inputYear"
                            className="form-label"
                        >
                            Year published
                        </label>
                        <input
                            type="number"
                            className="form-control"
                            id="inputYear"
                            placeholder="Year published"
                            value={yearPublished ?? ""}
                            onChange={(e) => setYearPublished(e.target.valueAsNumber ?? 0)}
                        />
                    </div>

                    <div className="mb-3 list-group">
                        <AuthorsInput
                            authors={authors}
                            setAuthors={setAuthors}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddBook;