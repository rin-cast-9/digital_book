import { Route, Routes, BrowserRouter } from "react-router-dom";
import "./styles/App.css";
import AdminPanel from "./components/pages/AdminPanel";

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/adminPanel" element={<AdminPanel />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App;
