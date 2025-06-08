'use client'; // This is required for Swiper to work with Next.js

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';
import { useMediaQuery } from 'react-responsive';
import '../styles/Carousel.css';

// Define the type for the API response image formats
interface ImageFormats {
  large: { url: string };
  medium: { url: string };
}

// Define the type for each image in the API response
interface APIImage {
  formats: ImageFormats;
}

// Define the type for the fetched images
interface CarouselImage {
  large: string;
  medium: string;
}

export default function Carousel() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  useEffect(() => {
    // Fetch images from the Strapi API
    const fetchImages = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/home-images?populate=images`);
        const data = await response.json();

        // Map the API response to extract large and medium image URLs
        const fetchedImages = data.data[0]?.images.map((image: APIImage) => ({
          large: `${image.formats.large.url}`,
          medium: `${image.formats.medium.url}`,
        }));

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
              src={isMobile ? image.medium : image.large} // Use medium for mobile, large for desktop
              alt={`Slide ${index + 1}`}
              fill
              className="carousel-image"
              {...(index === 0 ? { priority: true } : { loading: 'lazy' })} // Fix priority and lazy conflict
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
