'use client'; // This is required for Swiper to work with Next.js

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';
import '../styles/Carousel.css';

const images = [
  '/images/photo1.jpg', // Replace with your image paths
  '/images/photo2.jpg',
  '/images/photo3.jpg',
  '/images/photo4.jpg',
];

export default function Carousel() {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      modules={[Autoplay, Pagination, Navigation]}
      className="mySwiper w-full h-full"
    >
      {images.map((src, index) => (
        <SwiperSlide key={index}>
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={`Slide ${index + 1}`}
              layout="fill"
              className="carousel-image object-contain md:object-cover"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}