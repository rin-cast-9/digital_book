import { useMemo, useState } from "react";
import AuthorsInput from "../UI/AuthorsInput"
import { BookManagerContract, provider } from "../../constants/blockchain";
import { Wallet } from "ethers";
import { Interface } from "ethers";
import { useLocation } from "react-router-dom";
import { Book } from "../../constants/Book";


const AddBook = () => {
    const { state } = useLocation();
    const isEdit = Boolean(state?.book);
    const originalBook = state?.book as Book | undefined;

    const [title, setTitle] = useState(originalBook?.name ?? "");
    const [publisher, setPublisher] = useState(originalBook?.publisher ?? "");
    const [publisherCity, setPublisherCity] = useState(originalBook?.publisherCity ?? "");
    const [yearPublished, setYearPublished] = useState<number>(originalBook?.yearPublished ?? 0);
    const [authors, setAuthors] = useState<string[]>(originalBook?.authors ?? [""]);

    const modified = useMemo(() => {
        if (!originalBook) {
            return true;
        }

        return (
            title !== originalBook.name ||
            publisher !== originalBook.publisher ||
            publisherCity !== originalBook.publisherCity ||
            yearPublished !== originalBook.yearPublished ||
            JSON.stringify(authors.filter(a => a.trim())) !== JSON.stringify(originalBook.authors)
        );
    }, [title, publisher, yearPublished, authors, originalBook]);

    const handleUpdate = async () => {
        if (!originalBook) {
            console.error("No original book provided for update");
            return;
        }

        const operatorAddress = sessionStorage.getItem("operatorKey");
        if (!operatorAddress) {
            throw new Error("Unauthorized");
        }

        const operatorSigner = new Wallet(operatorAddress, provider);

        /**
         * uint32 _bookId,
         * uint16 _yearPublished,
         * string memory _name,
         * string memory _publisher,
         * string memory _publisherCity,
         * string[] memory _authors
         */
        await BookManagerContract.connect(operatorSigner).correctTypo(
            originalBook.bookId,
            yearPublished,
            title,
            publisher,
            publisherCity,
            authors
        );
    };

    const handleSubmit = async () => {
        const omittedLastEmptyAuthors = authors.slice(0, -1);

        const operatorAddress = sessionStorage.getItem("operatorKey");
        if (!operatorAddress) {
            throw new Error("Unauthorized access");
        }

        const operatorSigner = new Wallet(operatorAddress, provider);
        console.log(`${operatorSigner}`);
        
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
        )
        .catch((error: any) => {
            if (error.code === 'CALL_EXCEPTION' && error.data) {
                const iface = new Interface(BookManagerContract.interface.fragments);
                try {
                    const decoded = iface.parseError(error.data);
                    console.error('Custom error:', decoded?.name, decoded?.args);
                }
                catch {
                    console.error('Unknown revert data:', error.data);
                }
            } else {
                console.error(error);
            }
        });
    };

    return (
        <>
            <h2 className="mb-3">
                Book
            </h2>
            {isEdit ? (
                <button
                    className="btn btn-warning mb-4"
                    disabled={!modified}
                    onClick={handleUpdate}
                >
                    Update
                </button>
            ) : (
                <button
                    className="btn btn-outline-primary mb-4"
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            )}
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