import { useState } from "react";
import AuthorsInput from "../UI/AuthorsInput"


const AddBook = () => {
    const [title, setTitle] = useState("");
    const [publisher, setPublisher] = useState("");
    const [publisherCity, setPublisherCity] = useState("");
    const [yearPublished, setYearPublished] = useState<number>();
    const [authors, setAuthors] = useState<string[]>([""]);

    return (
        <>
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
                            value={yearPublished}
                            onChange={(e) => setYearPublished(e.target.valueAsNumber)}
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