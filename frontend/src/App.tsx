import { Route, Routes, BrowserRouter } from "react-router-dom";
import "./styles/App.css";
import AdminPanel from "./components/pages/AdminPanel";
import AddBook from "./components/pages/AddBook";
import BookCatalog from "./components/pages/BookCatalog";
import BookDetails from "./components/pages/BookDetails";
import Layout from "./components/UI/Layout";

const App = () => {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/adminPanel" element={<AdminPanel />} />
                        <Route path="/addBook" element={<AddBook />} />
                        <Route path="/books" element={<BookCatalog />} />
                        <Route path="/book/:id" element={<BookDetails />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App;
