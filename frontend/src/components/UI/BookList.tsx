import { Book } from "../../constants/Book";

export const BookList = ({ books, onClick }: { books: Book[], onClick: (id: number) => void }) => (
    <ul className="list-group">
        {books.map((book) => (
            <a
                key={book.bookId}
                href="#"
                onClick={e => {
                    e.preventDefault();
                    onClick(book.bookId);
                }}
                className="list-group-item list-group-item-action my-2 border rounded-4 px-4 pt-3 pb-1 shadow-sm container text-start"
            >
                <div className="row row-cols-2">
                    <h4 className="fs-4 fw-semibold col">{book.name}</h4>
                    <p className="fw-light col text-end">{book.publisher}, {book.publisherCity} {book.yearPublished.toString()}</p>
                    <p className="fw-light col">Authors: {book.authors.join(", ")}</p>
                    {book.isAdopted && <span className="fw-light col text-end">✔ Adopted</span>}                                
                </div>
            </a>
        ))}
    </ul>
);