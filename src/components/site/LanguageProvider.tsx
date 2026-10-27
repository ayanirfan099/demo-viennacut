"use client";
import { createContext, useContext, useEffect, useState } from "react";
type Language = "de" | "en";
const Context = createContext({
  language: "de" as Language,
  setLanguage: (l: Language) => {
    void l;
  },
  t: (de: string, en: string) => {
    void en;
    return de;
  },
});
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("de");
  useEffect(() => {
    const saved = localStorage.getItem("vienna-language");
    if (saved === "en") queueMicrotask(() => setLanguage("en"));
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    document.title =
      language === "de"
        ? "Vienna Cuts — Handwerk. Haltung. Dein Stil."
        : "Vienna Cuts — Craft. Character. Your style.";
  }, [language]);
  function change(l: Language) {
    setLanguage(l);
    localStorage.setItem("vienna-language", l);
  }
  return (
    <Context.Provider
      value={{
        language,
        setLanguage: change,
        t: (de, en) => (language === "de" ? de : en),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useLanguage = () => useContext(Context);
