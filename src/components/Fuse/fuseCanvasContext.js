import { createContext, useContext } from "react";

/** When true, edges render like studio but without remove controls (version view). */
export const FuseCanvasReadOnlyContext = createContext(false);

export const useFuseCanvasReadOnly = () => useContext(FuseCanvasReadOnlyContext);
