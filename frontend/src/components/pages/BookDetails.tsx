import { useParams } from "react-router-dom"
import { Book } from "../../constants/Book";


const BookDetails = () => {
    const { id } = useParams<{ id: string }> ();
    const books: Book[] = JSON.parse(localStorage.getItem("books") || "[]").map((book: Book) => ({
        ...book,
        yearPublished: Number(book.yearPublished),
    }));
    const book = books[Number(id)];

    if (!book) {
        return (
            <>
                <div>
                    Book not found.
                </div>
            </>
        );
    }

    return (
        <>
            <div className="">
                <h1 className="">{book.name}</h1>
                <p className="">{book.publisher}, {book.publisherCity} ({book.yearPublished.toString()})</p>
                <p className="">Authors: {book.authors.join(", ")}</p>
                {book.isAdopted && <p className="">✔ Adopted</p>}
            </div>
        </>
    )
}

export default BookDetails