export interface Book {
    name: string;
    publisher: string;
    publisherCity: string;
    authors: string[];
    yearPublished: bigint;
    isAdopted: boolean;
};