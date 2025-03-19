import { useParams } from "react-router-dom"
import { Book } from "../../constants/Book";
import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { BookManagerContract, provider } from "../../constants/blockchain";


const BookDetails = () => {
    const { id } = useParams<{ id: string }> ();
    const books: Book[] = JSON.parse(sessionStorage.getItem("books") || "[]").map((book: Book) => ({
        ...book,
        yearPublished: Number(book.yearPublished),
    }));
    const [book, setBook] = useState(books[Number(id)]);
    const [showModal, setShowModal] = useState(false);
    const [details, setDetails] = useState({
        firstName: '',
        lastName: '',
        address: '',
        phone: '',
    });

    const handleChange = (e: any) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    }

    const adoptBook = async () => {
        console.log('Adopting with: ', details);

        const userAddress = sessionStorage.getItem("userKey");
        if (!userAddress) {
            throw new Error("Unauthorized access");
        }

        const userSigner = await provider.getSigner(userAddress);
        
        await BookManagerContract.connect(userSigner).adoptBook(id);
        setBook(await BookManagerContract.getBook(id));
        setShowModal(false);
    };

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
            <div className="border rounded-4 shadow-sm p-4">
                <h1 className="">{book.name}</h1>
                <p className="">{book.publisher}, {book.publisherCity} ({book.yearPublished.toString()})</p>
                <p className="">Authors: {book.authors.join(", ")}</p>
                {book.isAdopted ?
                    <p>✔ Adopted</p> :
                    <button className="btn btn-success" onClick={() => setShowModal(true)}>Adopt</button>}
            </div>

            <Modal centered show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Book delivery
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={details.firstName}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={details.lastName}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={details.address}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                            type="text"
                            name="phone"
                            placeholder="Phone Number"
                            value={details.phone}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="success" onClick={() => {
                        adoptBook();
                    }}>Order</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default BookDetails;