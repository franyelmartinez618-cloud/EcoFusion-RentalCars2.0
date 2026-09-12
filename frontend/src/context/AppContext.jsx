/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import en from "../i18n/en";
import es from "../i18n/es";

const AppContext = createContext(null);

const translations = {
    en,
    es,
};

function getInitialTheme() {
    const savedTheme = localStorage.getItem("ecofusion-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return "light";
}

function getInitialLanguage() {
    const savedLanguage = localStorage.getItem("ecofusion-language");

    return savedLanguage === "es" ? "es" : "en";
}

export function AppProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);
    const [language, setLanguage] = useState(getInitialLanguage);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("ecofusion-theme", theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.lang = language;
        localStorage.setItem("ecofusion-language", language);
    }, [language]);

    const toggleTheme = () => {
        setTheme((currentTheme) =>
            currentTheme === "light" ? "dark" : "light"
        );
    };

    const toggleLanguage = () => {
        setLanguage((currentLanguage) =>
            currentLanguage === "en" ? "es" : "en"
        );
    };

    const value = useMemo(
        () => ({
            theme,
            language,
            translations: translations[language],
            setTheme,
            setLanguage,
            toggleTheme,
            toggleLanguage,
        }),
        [theme, language]
    );

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("useApp must be used inside AppProvider");
    }

    return context;
}