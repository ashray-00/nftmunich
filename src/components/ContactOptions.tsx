import React from 'react';
import { FaFacebookMessenger, FaInstagram, FaEnvelope, FaYoutube } from 'react-icons/fa';

const ContactOptions: React.FC = () => {
  return (
    <div className="flex justify-center space-x-9 mt-4">
      <a href="https://m.me/1043364702497762" target="_blank" rel="noopener noreferrer" className="text-2xl">
        <FaFacebookMessenger />
      </a>
      {/* <a href="https://wa.me/your-whatsapp-number" target="_blank" rel="noopener noreferrer" className="text-2xl">
        <FaWhatsapp />
      </a> */}
      <a href="https://www.instagram.com/nft_munich" target="_blank" rel="noopener noreferrer" className="text-2xl">
        <FaInstagram />
      </a>
      <a href="mailto:nftmunich@gmail.com" className="text-2xl">
        <FaEnvelope />
      </a>
      <a href="https://www.youtube.com/@nftmunich" target="_blank" rel="noopener noreferrer" className="text-2xl">
        <FaYoutube />
      </a>
    </div>
  );
};

export default ContactOptions;