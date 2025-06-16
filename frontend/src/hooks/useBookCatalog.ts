import { useEffect, useState } from "react"
import { Book } from "../constants/Book"
import { BookCatalogDB, initDB } from "../db/indexedDB";
import { BookManagerContract, DEPLOYMENT_BLOCK, provider } from "../constants/blockchain";
import { EventLog } from "ethers";
import { IDBPDatabase } from "idb";

export const useBookCatalog = () => {
    const [books, setBooks] = useState<Book[] | null> (null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBooks = async () => {
            const db = await initDB();
            const fromBlock = (await db.get("meta", "lastProcessedBlock"))?.value ?? DEPLOYMENT_BLOCK;
            const latestBlock = await provider.getBlockNumber();

            const [newEvents, typoSet] = await Promise.all([
                queryInChunks(
                    "BookAdded",
                    fromBlock + 1,
                    latestBlock
                ),
                fetchTypos(fromBlock, latestBlock)
            ]);

            const newBooks = newEvents
                .map(e => {
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
                })
                .filter(book => !typoSet.has(book.bookId));

            for (const book of newBooks) {
                await db.put("books", book);
            }

            await fetchAdoptions(db, fromBlock, latestBlock);
            await db.put("meta", { key: "lastProcessedBlock", value: latestBlock });

            for (const depricatedId of typoSet) {
                await db.delete("books", depricatedId);
            }

            setBooks(await db.getAll("books"));
            setLoading(false);
        };

        loadBooks();
    }, []);

    return { books, loading };
};

const fetchTypos = async (fromBlock: number, toBlock: number): Promise<Set<number>> => {
    const events = await queryInChunks(
        "BookTypoCorrected",
        fromBlock + 1,
        toBlock
    );

    return new Set(events.map(e => Number(e.args[0])));
};

const fetchAdoptions = async (db: IDBPDatabase<BookCatalogDB>, fromBlock: number, toBlock: number) => {
    const events = await queryInChunks(
        "BookAdopted",
        fromBlock + 1,
        toBlock
    );

    for (const e of events) {
        const id = Number(e.args[0]);
        const existing = await db.get("books", id);

        if (existing) {
            existing.isAdopted = true;
            await db.put("books", existing);
        }
    }
};

const queryInChunks = async (
    eventName: string,
    fromBlock: number,
    toBlock: number,
    chunkSize: number = 400
): Promise<EventLog[]> => {
    const events: EventLog[] = [];
    for (let start = fromBlock; start <= toBlock; start += chunkSize) {
        const end = Math.min(start + chunkSize - 1, toBlock);
        const chunk = await retryWithBackoff(() => BookManagerContract.queryFilter(eventName, start, end));
        events.push(...chunk as EventLog[]);
    }

    return events;
};

const retryWithBackoff = async <T> (fn: () => Promise<T>, retries = 5): Promise <T> => {
    for (let i = 0; i < retries; i ++) {
        try {
            return await fn();
        }
        catch (e: any) {
            if (e.code === 429 && i < retries - 1) {
                const delay = 1000 + Math.random() * 250;
                await new Promise(r => setTimeout(r, delay));
            }
            else {
                throw e;
            }
        }
    }

    throw new Error("Retry failed after max attempts");
};