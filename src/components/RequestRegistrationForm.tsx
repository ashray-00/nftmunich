import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import formFields from "../data/request_registration_form.json"; // Import the JSON file
import styles from "../styles/RequestRegistrationForm.module.css"; // Import the new CSS module

type FormData = {
    [key: string]: string | boolean; // Dynamic keys for form fields
};

const RequestRegistrationForm = ({ onSuccess, onError }: { onSuccess: () => void; onError: (message: string) => void }) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormData>();

    const email = watch("email"); // Watch the email field to compare with verifyEmail

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/player-registrations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    data: {
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        isLivingInMunich: data.isLivingInMunich,
                        beenInTraining: data.beenInTraining,
                    },
                }),
            });

            const result = await response.json();

            if (response.ok) {
                onSuccess();
            } else {
                onError(result.error.message || "An error occurred.");
            }
        } catch (error) {
            onError("An error occurred while submitting the form." + error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles["form-container"]}>
            {formFields.map((field) => (
                <div key={field.id} className={styles["form-field"]}>
                    <label htmlFor={field.id} className={styles["field-label"]}>
                        {field.label}
                        {field.required && <span className={styles["required-asterisk"]}>*</span>}
                    </label>

                    {/* Render subtext if it exists */}
                    {field.subtext && <p className={styles["field-subtext"]}>{field.subtext}</p>}

                    {/* Render input fields dynamically */}
                    {field.type === "radio" ? (
                        <div className={styles["radio-group"]}>
                            {field.options?.map((option) => (
                                <label key={option.value.toString()} className={styles["radio-option"]}>
                                    <input
                                        type="radio"
                                        value={String(option.value)}
                                        {...register(field.id, { required: field.required ? "Please select an option" : false })}
                                        className={styles["radio-input"]}
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    ) : (
                        <input
                            type={field.type}
                            id={field.id}
                            {...register(field.id, {
                                required: field.required ? `${field.label} is required` : false,
                                ...(field.type === "email" && {
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Please enter a valid email address",
                                    },
                                }),
                                ...(field.id === "verifyEmail" && {
                                    validate: (value) =>
                                        value === email || "Email and Verify Email must match",
                                }),
                            })}
                            className={styles["input-field"]}
                        />
                    )}

                    {/* Display validation errors */}
                    {errors[field.id] && <p className={styles["error-text"]}>{errors[field.id]?.message as string}</p>}
                </div>
            ))}

            <button type="submit" className={styles["submit-button"]}>
                Submit
            </button>
        </form>
    );
};

export default RequestRegistrationForm;