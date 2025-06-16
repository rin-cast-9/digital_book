import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookCatalog } from "../../hooks/useBookCatalog";
import { BookList } from "../UI/BookList";

const BookCatalog = () => {
    const { books, loading } = useBookCatalog();
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const filteredBooks = books?.filter(book => {
        const q = searchQuery.toLowerCase();

        return (
            book.name.toLowerCase().includes(q) ||
            book.publisher.toLowerCase().includes(q) ||
            book.publisherCity.toLowerCase().includes(q) ||
            book.authors.some(a => a.toLowerCase().includes(q)) ||
            book.yearPublished.toString().includes(q)
        );
    }) ?? [];

    return (
        <>
            <div className="max-w-4xl mx-auto p-4">
                <h1 className="font-bold mb-4">Book Catalog: {filteredBooks.length}</h1>
                <input
                    type="text"
                    placeholder="Search..."
                    className="form-control mb-3"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {filteredBooks.length > 0 ? (
                    <BookList
                        books={filteredBooks}
                        onClick={(i) => navigate(`/book/${i}`)}
                    />
                ) : (
                    <p className="border p-2 fs-4 rounded-4 shadow-sm">No books available at the moment.</p>
                )}
            </div>            
        </>
    );
};

export default BookCatalog;
