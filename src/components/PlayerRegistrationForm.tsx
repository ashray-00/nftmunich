"use client";

import React, { useState, useEffect } from 'react';
import styles from '../styles/PlayerRegistrationForm.module.css';

const PlayerRegistrationForm: React.FC = () => {
  const APP_ID = process.env.NEXT_PUBLIC_APP_ID;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    profession: '',
    address: '',
    position: '',
    consent: false,
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const isValid = Object.values(formData).every(
      value => value !== '' && value !== null) && formData.consent;
    setIsFormValid(isValid);
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value, // Handle checkbox state
    });
    if (name === "email") {
      setEmailError(""); // Clear email error when user modifies the email field
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formPayload = new FormData();
    formPayload.append('Name', formData.name);
    formPayload.append('Phone Number', formData.phone);
    formPayload.append('Email', formData.email);
    formPayload.append('Date Of Birth', formData.dob);
    formPayload.append('Profession', formData.profession);
    formPayload.append('Address', formData.address);
    formPayload.append('Preferred Position', formData.position);

    const baseURL = `https://script.google.com/macros/s/${APP_ID}/exec`;

    try {
      const res = await fetch(baseURL, {
        method: 'POST',
        body: formPayload,
      });
      const result = await res.json();

      if (result.result === 'success') {
        setIsSubmitted(true);
      } else if (result.result === 'error' && result.message === 'Email address already registered.') {
        setEmailError('This email address is already registered.'); // Set email error
      } else {
        alert('Failed to submit the form. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    }
  };
  return (
    <div className={styles.container}>
      {isSubmitted ? ( // Conditionally render success message or form
        <div className={styles.successMessage}>
          <h2>Player Registration Successful!</h2>
          <p>Thank you for registering. We will contact you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formLeft}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            <div className={`${styles.formGroup} ${emailError ? styles.error : ''}`}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                required
              />
              {emailError && <p className={styles.errorMessage}>{emailError}</p>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="dob">Date of Birth</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="profession">Profession</label>
              <input
                type="text"
                id="profession"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="position">Preferred Position</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>
          <div className={styles.formRight}>
            <div className={styles.formGroup}>
              <input
                type="checkbox"
                id="consent"
                name="consent"
                onChange={handleChange}
                required
                className={styles.checkbox}
              />
              <label htmlFor="consent" className={styles.checkboxLabel}>
                I agree to the collection and processing of my personal data in
                accordance with the{" "}
                <a href="/privacy-policy" className={styles.link}>
                  Privacy Policy
                </a>.
              </label>
            </div>
            <button type="submit" className={styles.submitButton} disabled={!isFormValid}>Register</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PlayerRegistrationForm;