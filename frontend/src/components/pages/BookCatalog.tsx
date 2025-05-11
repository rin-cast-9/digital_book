import { useEffect, useState } from "react";
import { BookManagerContract } from "../../constants/blockchain";
import { useNavigate } from "react-router-dom";
import { Book } from "../../constants/Book";

const BookCatalog = () => {
    const [books, setBooks] = useState<Book[] | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBooks = (isSessionStorageEmpty: boolean) => {
        if (isSessionStorageEmpty) {
            fetchBooksAnew();
        }
        else {
            syncSessionStorage();
        }

        setLoading(false);
    }

    const fetchBooksAnew = async () => {
        const fetchedBooks = await BookManagerContract.getBooks().catch(console.error);
        const serializedBooks = fetchedBooks.map(serializeBook);

        sessionStorage.setItem("books", JSON.stringify(serializedBooks));
        setBooks(fetchedBooks);
    }

    const syncSessionStorage = async () => {
        const localBooksRaw = sessionStorage.getItem("books")!
        const localBooks = JSON.parse(localBooksRaw).map(parseBook);
        const localLength = localBooks.length;

        const onChainLength: number = await BookManagerContract.getLength().catch(console.error);

        if (localLength >= onChainLength) {
            setBooks(localBooks);
            return;
        }
        
        const fetchedBooks = await BookManagerContract.getBooksInRange(localLength, onChainLength).catch(console.error);
        const serializedBooks = fetchedBooks.map(serializeBook);

        const updatedBooks = [...localBooks, ...fetchedBooks];
        setBooks(updatedBooks);

        const allSerialized = [...localBooks.map(serializeBook), ...serializedBooks];
        sessionStorage.setItem("books", JSON.stringify(allSerialized));
    }

    const parseBook = (obj: any): Book => ({
        name: obj.name,
        publisher: obj.publisher,
        publisherCity: obj.publisherCity,
        authors: obj.authors,
        yearPublished: BigInt(obj.yearPublished),
        isAdopted: obj.isAdopted,
    });

    const serializeBook = (book: Book) => ({
        name: book.name,
        publisher: book.publisher,
        publisherCity: book.publisherCity,
        authors: book.authors,
        yearPublished: book.yearPublished.toString(),
        isAdopted: book.isAdopted,
    });

    useEffect(() => {
        fetchBooks(!sessionStorage.getItem("books")?.trim());
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <>
            <div className="max-w-4xl mx-auto p-4">
                <h1 className="font-bold mb-4">Book Catalog</h1>
                {books && books.length > 0 ? (
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
                ) : (
                    <p className="border p-2 fs-4 rounded-4 shadow-sm">No books available at the moment.</p>
                )}
            </div>            
        </>
    );
};

export default BookCatalog;
