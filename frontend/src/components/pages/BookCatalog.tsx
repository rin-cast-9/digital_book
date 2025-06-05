import { useEffect, useState } from "react";
import { BookManagerContract, DEPLOYMENT_BLOCK, provider } from "../../constants/blockchain";
import { useNavigate } from "react-router-dom";
import { Book } from "../../constants/Book";
import { BookCatalogDB, initDB } from "../../db/indexedDB";
import { EventLog } from "ethers";
import { IDBPDatabase } from "idb";

const BookCatalog = () => {
    const [books, setBooks] = useState<Book[] | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBooks = async () => {
        const db = await initDB();

        const meta = await db.get("meta", "lastProcessedBlock");
        const fromBlock = meta?.value ?? DEPLOYMENT_BLOCK;
        const latestBlock = await provider.getBlockNumber();

        const [newEvents, typoMap] = await Promise.all([
            BookManagerContract.queryFilter(
                BookManagerContract.filters.BookAdded(),
                fromBlock + 1,
                latestBlock
            ),

            fetchTypos(fromBlock, latestBlock)
        ]);

        const newBooks = newEvents.map(event => {
            const e = event as EventLog;
            const args = e.args;

            return {
                bookId: Number(args[0]),
                name: args[3],
                publisher: args[4],
                publisherCity: args[5],
                authors: Object.values(args[6]),
                yearPublished: Number(args[2]),
                isAdopted: false,
            } as Book;
        });

        const filteredBooks = newBooks.filter(book => {
            return !typoMap.has(book.bookId);
        })

        for (const book of filteredBooks) {
            await db.put("books", book);
        }

        await fetchAdoptions(db, fromBlock, latestBlock);

        await db.put("meta", { key: "lastProcessedBlock", value: latestBlock });

        const updatedBooks = await db.getAll("books");
        setBooks(updatedBooks);
        setLoading(false);
    };

    const fetchTypos = async (fromBlock: number, toBlock: number): Promise<Map<number, number>> => {
        const typoEvents = await BookManagerContract.queryFilter(
            BookManagerContract.filters.BookTypoCorrected(),
            fromBlock + 1,
            toBlock
        );

        const correctionMap = new Map<number, number>();

        for (const event of typoEvents) {
            const args = (event as EventLog).args;
            correctionMap.set(Number(args[0]), Number(args[1]));
        }

        return correctionMap;
    };

    const fetchAdoptions = async (db: IDBPDatabase<BookCatalogDB>, fromBlock: number, toBlock: number): Promise<void> => {
        const adoptionEvents = await BookManagerContract.queryFilter(
            BookManagerContract.filters.BookAdoption(),
            fromBlock + 1,
            toBlock
        );

        const adoptedBookIds = new Set<number>();

        for (const event of adoptionEvents) {
            const args = (event as EventLog).args;
            adoptedBookIds.add(Number((args[0])));
        }

        for (const bookId of adoptedBookIds) {
            const existing = await db.get("books", bookId);
            if (existing) {
                existing.isAdopted = true;
                await db.put("books", existing);
            }
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <>
            <div className="max-w-4xl mx-auto p-4">
                <h1 className="font-bold mb-4">Book Catalog: {books?.length}</h1>
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
