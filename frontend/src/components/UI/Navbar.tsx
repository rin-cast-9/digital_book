import { useState } from "react";
import { Link } from "react-router-dom";


const Navbar = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-primary-subtle fixed-top">
                <div className="container">
                    <Link className="navbar-brand" to="/books">
                        Book App
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={() => setIsNavOpen(!isNavOpen)}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className={`collapse navbar-collapse ${isNavOpen ? "show" : ""}`} id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link" to="/books">
                                    Books
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/addBook">
                                    Add book
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/adminPanel">
                                    Admin panel
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;