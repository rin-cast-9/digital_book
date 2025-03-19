import { useEffect, useState } from "react";
import { BookManagerContract } from "../../constants/blockchain";
import { useNavigate } from "react-router-dom";
import { Book } from "../../constants/Book";
import { BigNumberish } from "ethers";

const BookCatalog = () => {
    const [books, setBooks] = useState<Book[] | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBooks = () => {
        BookManagerContract.getBooks()
            .then((fetchedBooks) => {
                const serializedBooks = fetchedBooks.map((book: Book) => ({
                    name: book.name,
                    publisher: book.publisher,
                    publisherCity: book.publisherCity,
                    authors: book.authors,
                    yearPublished: book.yearPublished.toString(),
                    isAdopted: book.isAdopted,
                }));

                setBooks(fetchedBooks);

                sessionStorage.setItem("books", JSON.stringify(serializedBooks));
            })
            .catch(console.error);
        
        setLoading(false);
    };

    const parseBook = (proxyObject: any): Book => {
        return {
            name: proxyObject[0] as string,
            publisher: proxyObject[1] as string,
            publisherCity: proxyObject[2] as string,
            authors: Array.isArray(proxyObject[3]) ? proxyObject[3].map(String) : [],
            yearPublished: BigInt(proxyObject[4]),
            isAdopted: Boolean(proxyObject[5]),
        };
    }

    const handleBookAddedEvent = (
        bookId: BigNumberish,
        addedBy: string,
        timestamp: BigNumberish
    ) => {
        BookManagerContract.getBook(bookId)
            .then((fetchedBook: any) => {
                const parsedBook = parseBook(fetchedBook);
                console.log(`parsedBook: ${parsedBook}`);

                const serializedBook = {
                    ...parsedBook,
                    authors: parsedBook.authors,
                    yearPublished: parsedBook.yearPublished.toString(),
                };
                console.log(`serializedBook: ${serializedBook}`);

                const existingBooks = JSON.parse(sessionStorage.getItem("books") || "[]");
                existingBooks.push(serializedBook);
                sessionStorage.setItem("books", JSON.stringify(existingBooks));

                setBooks(prevBooks => (prevBooks ? [...prevBooks, parsedBook] : [parsedBook]));
            })
            .catch(console.error);
    };

    useEffect(() => {
        BookManagerContract.on("BookAdded", handleBookAddedEvent);

        fetchBooks();

        return () => {
            BookManagerContract.off("BookAdded", handleBookAddedEvent);
        }
    }, []);

    // useEffect(() => {
    //     const storedBooks = localStorage.getItem("books");

    //     if (storedBooks && storedBooks !== "null") {
    //         setBooks(JSON.parse(storedBooks).map((book: Book) => ({
    //             ...book,
    //             yearPublished: Number(book.yearPublished),
    //         })));

    //         setLoading(false);
    //     }
    //     else {
    //         fetchBooks();
    //     }

    //     BookManagerContract.on("BookAdded", handleBookAddedEvent);

    //     return () => {
    //         BookManagerContract.off("BookAdded", handleBookAddedEvent);
    //     };
    // }, []);

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
