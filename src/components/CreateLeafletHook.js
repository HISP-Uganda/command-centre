import useRefEffect from "react-use-ref-effect";

function createLeafletHook(fn, name) {
    const func = function (...args) {
        const ref = useRefEffect(function () {
            ref.current = fn(...args);
            return () => {
                console.log("remove " + fn.name);
                ref.current.remove();
            };
        }, []);

        return ref;
    };

    Object.defineProperty(func, "name", { value: name });

    return func;
}

export default createLeafletHook;