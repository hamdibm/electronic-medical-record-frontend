import React, { useState } from 'react';

const Register = () => {
  // États pour gérer les valeurs des champs du formulaire
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sex, setSex] = useState('');
  const [country, setCountry] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    // Ajoutez ici la logique pour valider et soumettre le formulaire
    console.log('Formulaire soumis :', {
      fullName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      sex,
      country,
      dateOfBirth,
      city,
      agreeTerms,
    });
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div>
          <label>Full Name:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Phone Number */}
        <div>
          <label>Phone Number:</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <small>
            Password must contain:
            <ul>
              <li>At least 8 characters</li>
              <li>At least one Uppercase character (A-Z)</li>
              <li>At least one Lowercase character (a-z)</li>
              <li>At least one number (0-9)</li>
              <li>At least one Special character (*@#$%^&+=)</li>
            </ul>
          </small>
        </div>

        {/* Confirm Password */}
        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* Sex */}
        <div>
          <label>Sex:</label>
          <select value={sex} onChange={(e) => setSex(e.target.value)} required>
            <option value="">Select Sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Country */}
        <div>
          <label>Country:</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} required>
            <option value="">Select Country</option>
            <option value="usa">USA</option>
            <option value="canada">Canada</option>
            <option value="france">France</option>
            {/* Ajoutez d'autres pays ici */}
          </select>
        </div>

        {/* Date of Birth */}
        <div>
          <label>Date of Birth:</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </div>

        {/* City */}
        <div>
          <label>City:</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>

        {/* Terms of Use */}
        <div>
          <label>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            By clicking here you agree with our Terms Of Use.
          </label>
        </div>

        {/* Boutons Back et Register */}
        <div>
          <button type="button">Back</button>
          <button type="submit">Register</button>
        </div>
      </form>
    </div>
  );
};

export default Register;