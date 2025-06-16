import { useNavigate, useParams } from "react-router-dom"
import { Book } from "../../constants/Book";
import { useCallback, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { BookManagerContract, provider } from "../../constants/blockchain";
import { initDB } from "../../db/indexedDB";
import { AdoptionModal } from "../UI/AdoptionModal";


const BookDetails = () => {
    const { id } = useParams<{ id: string }> ();
    const bookId = Number(id);

    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [details, setDetails] = useState({
        firstName: '',
        lastName: '',
        address: '',
        phone: '',
    });

    const navigate = useNavigate();

    const isOperator = !!sessionStorage.getItem("operatorKey");

    useEffect(() => {
        const fetchBook = async () => {
            const db = await initDB();
            const storedBook = await db.get("books", bookId);
            setBook(storedBook || null);
            setLoading(false);
        };

        fetchBook();
    }, [bookId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const adoptBook = useCallback(async () => {
        const userAddress = sessionStorage.getItem("userKey");

        if (!userAddress) {
            throw new Error("Unauthorized access");
        }

        const userSigner = await provider.getSigner(userAddress);
        
        await BookManagerContract.connect(userSigner).adoptBook(id);

        const updated = await BookManagerContract.getBook(id);
        setBook(updated);
        setShowModal(false);
    }, [id]);

    if (!book || loading) {
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
            <div className="border rounded-4 shadow-sm p-4">
                <h1>{book.name}</h1>
                <p>{book.publisher}, {book.publisherCity} ({book.yearPublished})</p>
                <p>Authors: {book.authors.join(", ")}</p>

                {book.isAdopted ? (
                    <p>✔ Adopted</p>
                ) : (
                    <button className="btn btn-success" onClick={() => setShowModal(true)}>Adopt</button>
                )}

                {isOperator && (
                    <button className="btn btn-warning ms-2" onClick={() => navigate(`/addBook`, { state: { book }})}>Edit</button>
                )}
            </div>

            <AdoptionModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={adoptBook}
                details={details}
                onChange={handleChange}
            />
        </>
    )
}

export default BookDetails;