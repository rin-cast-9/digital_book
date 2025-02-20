import { Route, Routes, BrowserRouter } from "react-router-dom";
import "./styles/App.css";
import AdminPanel from "./components/pages/AdminPanel";
import AddBook from "./components/pages/AddBook";

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/adminPanel" element={<AdminPanel />} />
                    <Route path="/addBook" element={<AddBook />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App;
