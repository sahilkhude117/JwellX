import { useState } from "react";

export function useTogglePassword() {
    const [isVisible, setIsVisible] = useState(false);

    const toggle = () => setIsVisible(!isVisible);

    return {
        isVisible,
        toggle,
        type: isVisible ? "text" : "password",
    };
}