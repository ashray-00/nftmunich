import React from 'react';
import { FaFacebookMessenger, FaInstagram, FaEnvelope, FaYoutube } from 'react-icons/fa';

const ContactOptions: React.FC = () => {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <ContactLink href="mailto:nftmunich@gmail.com" icon={<FaEnvelope />} title="Email" detail="nftmunich@gmail.com" />
      <ContactLink href="https://www.instagram.com/nft_munich" icon={<FaInstagram />} title="Instagram" detail="@nft_munich" external />
      <ContactLink href="https://www.youtube.com/@nftmunich" icon={<FaYoutube />} title="YouTube" detail="@nftmunich" external />
      <ContactLink href="https://m.me/1043364702497762" icon={<FaFacebookMessenger />} title="Messenger" detail="Message the club" external />
    </div>
  );
};

function ContactLink({ href, icon, title, detail, external = false }: { href: string; icon: React.ReactNode; title: string; detail: string; external?: boolean }) {
  return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="group flex min-h-32 flex-col justify-between rounded-2xl border border-blue-950/10 bg-slate-50/80 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-blue-600/30 hover:bg-white hover:shadow-lg">
    <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-700 text-lg text-white transition-transform group-hover:scale-105">{icon}</span>
    <span className="mt-5"><strong className="block text-lg text-bavarian-blue">{title}</strong><span className="block break-words text-sm text-slate-500">{detail}</span></span>
  </a>;
}

export default ContactOptions;
