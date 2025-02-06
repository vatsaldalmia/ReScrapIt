import ChatNavbar from "./components/ChatNavbar";

import SettingsPage from "./components/settingpage";

import { Routes, Route } from "react-router-dom";
import { useThemeStore } from "./Store/ThemeStore";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { theme } = useThemeStore();

  return (
    <div data-theme={theme}>
      <ChatNavbar />

      <Routes>
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
