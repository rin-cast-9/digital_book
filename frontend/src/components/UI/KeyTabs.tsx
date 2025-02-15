import { useState } from 'react';
import KeyManagement from './KeyManagement';

const KeyTabs = () => {
    const [activeTab, setActiveTab] = useState("verification");

    return (
        <>
            <nav
                className="nav nav-tabs mt-auto"
                id="nav-tab"
                role="tablist"
            >
                <button
                    className={`nav-link ${activeTab === "management" ? "active" : ""}`}
                    onClick={() => setActiveTab("management")}
                    type="button"
                >
                    Key management
                </button>
                <button
                    className={`nav-link ${activeTab === "verification" ? "active" : ""}`}
                    onClick={() => setActiveTab("verification")}
                    type="button"
                >
                    Key verification
                </button>
            </nav>
            <div
                className="tab-content mt-3"
                style={{ minHeight: "600px" }}
            >
                <div
                    className={`tab-pane fade ${activeTab === "management" ? "show active" : ""}`}
                >
                    <KeyManagement />
                </div>
                <div
                    className={`tab-pane fade mt-2 ${activeTab === "verification" ? "show active" : ""}`}
                >
                    Key verification
                </div>
            </div>
        </>
    );
};

export default KeyTabs;