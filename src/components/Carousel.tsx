'use client'; // This is required for Swiper to work with Next.js

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';
import '../styles/Carousel.css';

// Define the type for the API response image formats
interface APIImage {
  url: string;
}

// Define the type for the fetched images
interface CarouselImage {
  original: string;
}

export default function Carousel() {
  const [images, setImages] = useState<CarouselImage[]>([]);

  useEffect(() => {
    // Fetch images from the Strapi API
    const fetchImages = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/home-images?populate=images`);
        const data = await response.json();

        // Map the API response to extract large and medium image URLs
        // After:
        const fetchedImages = data.data[0]?.images.map((image: APIImage) => ({
          original: image.url,
        }));

        setImages(fetchedImages || []);

        setImages(fetchedImages || []);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  return (
    <Swiper
      spaceBetween={10} // Reduce space between slides for mobile
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
      {images.map((image, index) => (
        <SwiperSlide key={index}>
          <div className="relative w-full h-full">
            <Image
              src={image.original}
              alt={`Slide ${index + 1}`}
              fill
              className="carousel-image"
              {...(index === 0 ? { priority: true } : { loading: 'lazy' })}
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
