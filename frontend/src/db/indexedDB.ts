import { openDB, DBSchema } from "idb";
import { Book } from "../constants/Book";
import { Meta } from "../constants/Meta";

export interface BookCatalogDB extends DBSchema {
    books: {
        key: number;
        value: Book;
    };
    meta: {
        key: string;
        value: Meta;
    };
}

export const initDB = async () => {
    return await openDB <BookCatalogDB> ("BookCatalogDB", 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("books")) {
                db.createObjectStore("books", { keyPath: "bookId" });
            }

            if (!db.objectStoreNames.contains("meta")) {
                db.createObjectStore("meta", { keyPath: "key" });
            }
        },
    });
}