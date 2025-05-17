import React, { useState } from "react";

const ConsentSection = ({ onAgree }: { onAgree: () => void }) => {
    const [hasDisagreed, setHasDisagreed] = useState(false);

    const handleAgree = () => {
        onAgree(); // Trigger the onAgree callback
        setHasDisagreed(false); // Reset disagreement message
    };

    const handleDisagree = () => {
        setHasDisagreed(true);
    };

    return (
        <div className="mt-8 text-center">
            <p className="mb-4">
                I agree to the collection and processing of my personal data in
                accordance with the{" "}
                <a href="/privacy-policy" className="text-blue-600 underline">
                    Privacy Policy
                </a>.
            </p>
            <div className="flex justify-center gap-4">
                <button
                    onClick={handleAgree}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                    Agree
                </button>
                <button
                    onClick={handleDisagree}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                    Disagree
                </button>

            </div>
            {hasDisagreed && (
                <p className="mt-4 text-red-600">
                    You need to agree to the consent to proceed with registration.
                </p>
            )}
        </div>
    );
};

export default ConsentSection;