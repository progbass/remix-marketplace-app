//
import { useState, useEffect } from "react";

export default function (key: string) {
    const [state, setState] = useState<string|null>(null);
  
    useEffect(() => {
      setState(window.localStorage.getItem(key));
    }, [key]);
  
    const setWithLocalStorage = (nextState:string|null) => {
        window.localStorage.setItem(key, nextState || "");
      setState(nextState);
    };
  
    return [state, setWithLocalStorage];
  }
  