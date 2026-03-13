'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function HeroSlider({ slides = [] }) {
    if (!slides || slides.length === 0) return null;

    return (
        <section
            data-testid="hero-main-slider"
            className="hero-main-slider relative w-full h-[60vh] min-h-[300px] md:h-[400px] lg:h-[550px] mb-6 md:mb-0 overflow-hidden bg-white shadow-lg"
        >
            <Swiper
                modules={[Autoplay, Pagination]}
                loop={true}
                autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                pagination={{ clickable: true }}
                allowTouchMove={true}
                simulateTouch={true}
                touchEventsTarget="container"
                className="w-full h-full hero-swiper"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index} className="relative w-full h-full bg-white overflow-hidden">
                        {/* Shadow Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-[1] pointer-events-none"></div>

                        {/* Mobile Image */}
                        {slide?.mobileSrc && (
                            <div className="relative w-full h-full md:hidden">
                                <Image
                                    src={slide.mobileSrc}
                                    alt={slide.alt || `Slide ${index + 1}`}
                                    fill
                                    sizes="100vw"
                                    priority={index === 0}
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        )}

                        {/* Desktop Image */}
                        {slide?.pcSrc && (
                            <div className="relative w-full h-full hidden md:block">
                                <Image
                                    src={slide.pcSrc}
                                    alt={slide.alt || `Slide ${index + 1}`}
                                    fill
                                    sizes="100vw"
                                    priority={index === 0}
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>

            <style jsx global>{`
                .hero-swiper .swiper-pagination {
                    bottom: 20px;
                    z-index: 10;
                }
                .hero-swiper .swiper-pagination-bullet {
                    width: 10px;
                    height: 10px;
                    background: rgba(255, 255, 255, 0.5);
                    opacity: 1;
                    transition: all 0.3s ease;
                }
                .hero-swiper .swiper-pagination-bullet-active {
                    background: white;
                    transform: scale(1.3);
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
                }
            `}</style>
        </section>
    );
}
