export interface Book {
    bookId: number;
    name: string;
    publisher: string;
    publisherCity: string;
    authors: string[];
    yearPublished: number;
    isAdopted: boolean;
};