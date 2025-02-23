import { useEffect, useState } from "react";
import { BookManagerContract } from "../../constants/blockchain";
import { useNavigate } from "react-router-dom";
import { Book } from "../../constants/Book";

const BookCatalog = () => {
    const [books, setBooks] = useState<Book[] | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const fetchedBooks = await getBooksFromBlockchain();
                // fetchedBooks?.forEach((e, i) => {
                //     console.log(`${i}: ${e}`);
                // });

                const serializedBooks = fetchedBooks?.map(book => ({
                    name: book.name,
                    publisher: book.publisher,
                    publisherCity: book.publisherCity,
                    authors: book.authors,
                    yearPublished: book.yearPublished.toString(),
                    isAdopted: book.isAdopted,
                }));
                // serializedBooks?.forEach((e, i) => {
                //     console.log(`${i}: ${e}`);
                // });

                setBooks(fetchedBooks);
                localStorage.setItem("books", JSON.stringify(serializedBooks, (key, value) => {
                    if (typeof value === "bigint") {
                        return value.toString();
                    }
                    return value;
                }));
            }
            catch (error) {
                console.error(`Error fetching books: ${error}`);
            }
            finally {
                setLoading(false);
            }
        };

        const storedBooks = localStorage.getItem("books");

        if (storedBooks) {
            setBooks(JSON.parse(storedBooks).map((book: Book) => ({
                ...book,
                yearPublished: Number(book.yearPublished),
            })));
            setLoading(false);
        }
        else {
            fetchBooks();
        }
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <>
            <div className="max-w-4xl mx-auto p-4">
                <h1 className="font-bold mb-4">Book Catalog</h1>
                <ul className="list-group">
                    {books?.map((book, index) => (
                        <a
                            key={index}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(`/book/${index}`);
                            }}
                            className="list-group-item list-group-item-action my-2 border rounded-4 px-4 pt-3 pb-1 shadow-sm container text-start"
                        >
                            <div className="row row-cols-2">
                                <h4 className="fs-4 fw-semibold col">{book.name}</h4>
                                <p className="fw-light col text-end">{book.publisher}, {book.publisherCity} ({book.yearPublished.toString()})</p>
                                <p className="fw-light col">Authors: {book.authors.join(", ")}</p>
                                {book.isAdopted && <span className="fw-light col text-end">✔ Adopted</span>}                                
                            </div>
                        </a>
                    ))}
                </ul>
            </div>            
        </>
    );
};

// Mock blockchain call
async function getBooksFromBlockchain(): Promise<Book[] | null> {
    return await BookManagerContract.getBooks();
}

export default BookCatalog;
