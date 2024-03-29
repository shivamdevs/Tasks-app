import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { auth } from './fb.user';
import { useAuthState } from "react-firebase-hooks/auth";

import './styles/override.css';

import Loading from "./components/layouts/Loading";
import About from "./components/pages/About";
import Notfound from "./components/layouts/Notfound";
import Welcome from "./components/pages/Welcome";
import HomeLayout from "./components/layouts/HomeLayout";
import { BrowserView, MobileView } from "react-device-detect";
import Desktop from "./components/desktop/Desktop";
import Accounts from "myoasis-accounts";

function App() {
    const navigate = useNavigate();
    const [user, loading, error] = useAuthState(auth);

    useEffect(() => {
        if (error) console.error(error);
    }, [error, loading, navigate, user]);

    return (
        <>
            <BrowserView>
                <Desktop />
            </BrowserView>
            <MobileView>
                {!loading && <>
                    <Routes>
                        <Route path="/lists/*" element={<HomeLayout />} />
                        <Route path="/accounts/*" element={<Accounts onUserChange={() => navigate(-1)} />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/" exact element={<Welcome />} />
                        <Route path="*" element={<Notfound />} />
                    </Routes>
                </>}
            </MobileView>
            {loading && <Loading />}
        </>
    );
};

export default App;