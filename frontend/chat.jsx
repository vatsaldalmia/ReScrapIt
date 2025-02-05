import Navbar from "./components/Navbar";

import SettingsPage from "./pages/settingpage";

import { Routes, Route } from "react-router-dom";
import { useThemeStore } from "./store/useThemeStore";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { theme } = useThemeStore();

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
