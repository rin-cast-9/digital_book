import React from "react";
import { Button, Form, Modal } from "react-bootstrap";

export const AdoptionModal = ({
    show,
    onClose,
    onSubmit,
    details,
    onChange,
}: {
    show: boolean;
    onClose: () => void;
    onSubmit: () => void;
    details: {
        firstName: string;
        lastName: string;
        address: string;
        phone: string
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <Modal centered show={show} onHide={onClose}>
        <Modal.Header closeButton>
            <Modal.Title>
                Book delivery
            </Modal.Title>
        </Modal.Header>

        <Modal.Body>
            {["firstName", "lastName", "address", "phone"].map((field) => (
                <Form.Group className="mb-3" key={field}>
                    <Form.Label>
                        {field[0].toUpperCase() + field.slice(1)}
                    </Form.Label>
                    <Form.Control
                        type="text"
                        name={field}
                        placeholder={field}
                        value={(details as any)[field]}
                        onChange={onChange}
                    />
                </Form.Group>
            ))}
        </Modal.Body>

        <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="success" onClick={onSubmit}>Order</Button>
        </Modal.Footer>
    </Modal>
);