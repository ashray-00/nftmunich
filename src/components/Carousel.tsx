'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';
import '../styles/Carousel.css';

interface APIImage {
  url: string;
}

interface CarouselImage {
  original: string;
}

const CACHE_KEY = "carouselImages";
const CACHE_TIME_KEY = "carouselImagesCacheTime";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in ms

export default function Carousel() {
  const [images, setImages] = useState<CarouselImage[]>([]);

  useEffect(() => {
    const now = Date.now();
    const cachedImages = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (
      cachedImages &&
      cachedTime &&
      now - parseInt(cachedTime, 10) < CACHE_DURATION
    ) {
      setImages(JSON.parse(cachedImages));
      return;
    }

    const fetchImages = async () => {
      try {
        const response = await fetch("/api/carousel");
        const data = await response.json();

        const fetchedImages = data.data[0]?.images.map((image: APIImage) => ({
          original: image.url,
        }));

        setImages(fetchedImages || []);
        localStorage.setItem(CACHE_KEY, JSON.stringify(fetchedImages || []));
        localStorage.setItem(CACHE_TIME_KEY, now.toString());
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  return (
    <Swiper
      spaceBetween={10}
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
