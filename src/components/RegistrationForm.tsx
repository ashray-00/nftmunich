import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import formConfig from "../data/player_registration_form.json";
import styles from "../styles/RegistrationForm.module.css";
import remarkGfm from "remark-gfm";
import CryptoJS from "crypto-js";

const RegistrationForm = () => {
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    type FormData = Record<number, string | string[]>; // Define a type for form data
    const [formData, setFormData] = useState<FormData>({});
    const [formSubmitted, setFormSubmitted] = useState(false); // Track if the form is submitted
    const methods = useForm();

    const currentSection = formConfig[currentSectionIndex];

    // Watch all fields in the current section
    const watchedFields = methods.watch();

    // Check if all required fields in the current section are filled
    const isSectionValid = currentSection.fields.every((field) => {
        if (field.required) {
            const value = watchedFields[field.id];
            if (field.type === "multi-select") {
                return value && value.length > 0; // Ensure at least one option is selected
            }
            return value && value.trim() !== "";
        }
        return true;
    });

    useEffect(() => {
        const defaultValues = currentSection.fields.reduce<Record<number, string | string[]>>((acc, field) => {
            if (field.type !== "info") { // Skip `info` fields
                acc[field.id] = formData[field.id] || (field.type === "multi-select" ? [] : ""); // Use saved value or empty string/array
            }
            return acc;
        }, {});
        methods.reset(defaultValues); // Reset the form with new default values
    }, [currentSectionIndex, methods, currentSection.fields, formData]);

    const handleNext = (data: FormData) => {
        const filteredData = Object.keys(data).reduce((acc, key) => {
            const fieldConfig = currentSection.fields.find((field) => field.id === parseInt(key, 10));
            if (fieldConfig && fieldConfig.type !== "info") { // Skip `info` fields
                acc[parseInt(key, 10)] = data[parseInt(key, 10)];
            }
            return acc;
        }, {} as FormData);

        setFormData((prevData: FormData) => ({
            ...prevData,
            ...filteredData, // Merge current section data with previously saved data
        }));

        // Move to the next section
        if (currentSectionIndex < formConfig.length - 1) {
            setCurrentSectionIndex(currentSectionIndex + 1);
        }
    };

    const handleBack = () => {
        // Move to the previous section
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(currentSectionIndex - 1);
        }
    };

    const encryptData = (data: FormData) => {
        const keyBase64 = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || ""; // Use environment variable
        const ivBase64 = process.env.NEXT_PUBLIC_ENCRYPTION_IV || ""; // Use environment variable

        const key = CryptoJS.enc.Base64.parse(keyBase64); // Convert from Base64 to WordArray
        const iv = CryptoJS.enc.Base64.parse(ivBase64); // Convert from Base64 to WordArray

        const encrypted = CryptoJS.AES.encrypt(
            JSON.stringify(data), // Convert data to string
            key, // Pass the key as WordArray
            {
                iv: iv, // Pass the IV as WordArray
                mode: CryptoJS.mode.CBC, // Use CBC mode
                padding: CryptoJS.pad.Pkcs7, // Use PKCS7 padding
            }
        );

        return encrypted.toString(); // Return the encrypted data as a string
    };

    const sendDataToServer = async (encryptedData: string) => {
        const url = process.env.NEXT_PUBLIC_SERVER_URL || "";
        try {
            const response = await fetch(url, {
                method: "POST", // Use POST for sending data
                headers: {
                    "Content-Type": "application/json", // Specify JSON content type
                },
                body: JSON.stringify({ data: encryptedData }), // Send encrypted data in the request body
            });

            if (response.ok) {
                setFormSubmitted(true); // Mark the form as submitted
            } else {
                console.error("Failed to send data:", response.statusText);
            }
        } catch (error) {
            console.error("Error sending data:", error);
        }
    };

    const onSubmit = async (data: Record<number, string>) => {
        // Save final section data
        const finalData = { ...formData, ...data };

        if (currentSectionIndex === formConfig.length - 1) {
            // Encrypt the data
            const encryptedData = encryptData(finalData);

            // Send the encrypted data to the server
            await sendDataToServer(encryptedData);
        } else {
            handleNext(data);
        }
    };

    if (formSubmitted) {
        return (
            <div className={styles["thank-you-message"]}>
                <h2>Thank you for filling out the form!</h2>
                <p>Your response has been successfully submitted.</p>
                <div className={styles["membership-info"]}>
                    <h3>Please pay the membership fee</h3>
                    <p>
                        <strong>Membership Fee:</strong>
                    </p>
                    <p>
                        For <strong>Students/Azubis</strong>: 50€<br />
                        For <strong>Others</strong>: 100€
                    </p>
                    <p>
                        <strong>PayPal Email:</strong> nftmunich2014@gmail.com
                    </p>
                    <p>
                        <strong>Subject:</strong> NFT Yearly Contribution 2025_your name_email only
                    </p>
                    <p>
                        <strong>Important:</strong> When making the payment, please select the &quot;Friends and Family&quot; option to avoid additional fees.
                    </p>
                    <p>
                        Please ensure you include the correct subject when making the payment to help us track your contribution.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className={styles["form-container"]}>
                <h2 className={styles["section-title"]}>{currentSection.section}</h2>
                {currentSection.fields.map((field) => (
                    <div key={field.id} className={styles["form-field"]}>
                        {field.type === "info" ? (
                            <div className={styles["info-field"]}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{field.label}</ReactMarkdown>
                                {field.subtext && (
                                    <div className={styles["field-subtext"]}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{field.subtext}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <label className={styles["field-label"]}>
                                    {field.label}
                                    {field.required && <span className={styles["required-asterisk"]}> *</span>}
                                </label>
                                {field.subtext && (
                                    <div className={styles["field-subtext"]}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {field.subtext}
                                        </ReactMarkdown>
                                    </div>
                                )}
                                {field.type === "short-text" && (
                                    <input
                                        type="text"
                                        {...methods.register(`${field.id}`, { required: field.required })}
                                        className={styles["input-field"]}
                                    />
                                )}
                                {field.type === "long-text" && (
                                    <textarea
                                        {...methods.register(`${field.id}`, { required: field.required })}
                                        className={styles["textarea-field"]}
                                    />
                                )}
                                {field.type === "multi-select" && (
                                    <div className={styles["checkbox-group"]}>
                                        {field.options?.map((option) => (
                                            <label key={option.value} className={styles["checkbox-option"]}>
                                                <input
                                                    type="checkbox"
                                                    value={option.value}
                                                    {...methods.register(`${field.id}`, { required: field.required })}
                                                    className={styles["checkbox-input"]}
                                                />
                                                {option.label}
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {field.type === "email" && (
                                    <input
                                        type="email"
                                        {...methods.register(`${field.id}`, {
                                            required: field.required,
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Regex for email validation
                                                message: "Please enter a valid email address", // Error message
                                            },
                                        })}
                                        className={styles["input-field"]}
                                    />
                                )}
                                {methods.formState.errors[field.id]?.type === "pattern" && (
                                    <p className={styles["error-text"]}>
                                        {(methods.formState.errors[field.id]?.message as string) ?? "Invalid input"}
                                    </p>
                                )}

                                {field.type === "radio" && (
                                    <div className={styles["radio-group"]}>
                                        {field.options?.map((option) => (
                                            <label key={option.value} className={styles["radio-option"]}>
                                                <input
                                                    className={styles["radio-input"]}
                                                    type="radio"
                                                    value={option.value}
                                                    {...methods.register(`${field.id}`, { required: field.required })}
                                                />
                                                {option.label}
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {field.type === "rating" && (
                                    <input
                                        type="number"
                                        {...methods.register(`${field.id}`, {
                                            required: field.required,
                                            min: "min" in field && field.min !== undefined ? field.min : undefined,
                                            max: "max" in field && field.max !== undefined ? field.max : undefined,
                                        })}
                                        className={styles["input-field"]}
                                        min={"min" in field && field.min !== undefined ? field.min : undefined} // HTML attribute to prevent smaller values
                                        max={"max" in field && field.max !== undefined ? field.max : undefined} // HTML attribute to prevent larger values
                                    />
                                )}
                                {methods.formState.errors[field.id]?.type === "min" && (
                                    <p className={styles["error-text"]}>
                                        {field.label} must be at least {"min" in field && field.min}.
                                    </p>
                                )}
                                {methods.formState.errors[field.id]?.type === "max" && (
                                    <p className={styles["error-text"]}>
                                        {field.label} must be at most {"max" in field && field.max}.
                                    </p>
                                )}
                            </>
                        )}
                        {methods.formState.errors[field.id] && (
                            <p className={styles["error-text"]}>{field.label} is required</p>
                        )}
                    </div>
                ))}
                <div className={styles["form-navigation"]}>
                    {currentSectionIndex > 0 && (
                        <button type="button" onClick={handleBack} className={styles["back-button"]}>
                            Back
                        </button>
                    )}
                    <button
                        type="submit"
                        className={`${styles["next-button"]} ${!isSectionValid ? styles["disabled-button"] : ""}`}
                        disabled={!isSectionValid} // Disable button if section is invalid
                    >
                        {currentSectionIndex === formConfig.length - 1 ? "Submit" : "Next"}
                    </button>
                </div>
            </form>
        </FormProvider>
    );
};

export default RegistrationForm;