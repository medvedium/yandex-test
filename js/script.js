document.addEventListener("DOMContentLoaded", () => {

    // Marquee
    const marqueeContainers = document.querySelectorAll(".marquee-container");

    function setupMarquee(container) {
        const marqueeContent = container.querySelector(".marquee-content");

        const originalContent = marqueeContent.getAttribute("data-original-content") || marqueeContent.innerHTML;
        if (!marqueeContent.getAttribute("data-original-content")) {
            marqueeContent.setAttribute("data-original-content", originalContent);
        }

        marqueeContent.innerHTML = originalContent;

        const containerWidth = container.offsetWidth;
        while (marqueeContent.scrollWidth < containerWidth * 2) {
            marqueeContent.innerHTML += originalContent;
        }

        const contentWidth = marqueeContent.scrollWidth;
        const duration = contentWidth / 100;
        marqueeContent.style.animationDuration = `${duration}s`;
    }

    marqueeContainers.forEach((container) => setupMarquee(container));

    window.addEventListener("resize", () => {
        marqueeContainers.forEach((container) => setupMarquee(container));
    });

    // Stages Slider
    if (document.querySelector('.stages__slider')) {
        const sliderContainer = document.querySelector('.stages__slider');
        const slides = Array.from(sliderContainer.querySelectorAll('.stages__item'));
        const prevButton = document.querySelector('.slider__button--prev');
        const nextButton = document.querySelector('.slider__button--next');
        const paginationContainer = document.querySelector('.pagination');

        let currentSlide = 0;
        let slideElements = [];
        let isSliderActive = false;

        const originalSlidesHTML = sliderContainer.innerHTML;

        function mergeSlides() {
            const mergedSlides = [];
            const mergePairs = [[0, 1], [3, 4]];

            let skipIndexes = [];

            slides.forEach((slide, index) => {
                if (skipIndexes.includes(index)) return;

                const pair = mergePairs.find(p => p[0] === index);
                if (pair) {
                    const mergedSlide = document.createElement('div');
                    mergedSlide.classList.add('stages__item', 'stages-item', 'slider__item', 'stages-item--merged');
                    mergedSlide.innerHTML = `<div>${slides[pair[0]].innerHTML}</div><div>${slides[pair[1]].innerHTML}</div>`;

                    mergedSlides.push(mergedSlide);
                    skipIndexes.push(pair[1]);
                } else {
                    mergedSlides.push(slide.cloneNode(true));
                }
            });

            return mergedSlides;
        }

        function generatePagination() {
            paginationContainer.innerHTML = '';
            slideElements.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.classList.add('pagination__dot');
                if (index === currentSlide) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(index));
                paginationContainer.appendChild(dot);
            });
        }

        function updatePagination() {
            const dots = paginationContainer.querySelectorAll('.pagination__dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        function goToSlide(index) {
            currentSlide = index;
            sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
            updatePagination();
            updateButtons();
        }

        function updateButtons() {
            prevButton.disabled = currentSlide === 0;
            nextButton.disabled = currentSlide === slideElements.length - 1;
        }

        function activateSlider() {
            if (isSliderActive) return;
            isSliderActive = true;

            slideElements = mergeSlides();

            sliderContainer.innerHTML = '';
            slideElements.forEach(slide => sliderContainer.appendChild(slide));


            currentSlide = 0;
            sliderContainer.style.display = 'flex';
            sliderContainer.style.transition = 'transform 0.3s ease';
            sliderContainer.style.width = `${slideElements.length * 100}%`;
            slideElements.forEach(slide => slide.style.flex = '0 0 100%');

            generatePagination();
            updateButtons();
        }

        function deactivateSlider() {
            if (!isSliderActive) return;
            isSliderActive = false;
            sliderContainer.innerHTML = originalSlidesHTML;
            sliderContainer.style.cssText = '';
            paginationContainer.innerHTML = '';
        }

        function handleResize() {
            if (window.innerWidth < 768) {
                activateSlider();
            } else {
                deactivateSlider();
            }
        }

        prevButton.addEventListener('click', () => goToSlide(currentSlide - 1));
        nextButton.addEventListener('click', () => goToSlide(currentSlide + 1));

        window.addEventListener('resize', handleResize);
        handleResize();
    }

    // Participans slider
    function initSlider(config) {
        const container = document.querySelector(config.selector);
        const slider = container.querySelector('.slider');
        const items = container.querySelectorAll('.slider__item');
        const prevButton = container.querySelector('.slider__button--prev');
        const nextButton = container.querySelector('.slider__button--next');
        const currentSpan = container.querySelector('.current');
        const totalSpan = container.querySelector('.total');

        let currentIndex = 0;
        let slideInterval = null;
        let slidesToShow = config.slidesToShow || 1;

        function updateSlidesToShow() {
            if (config.responsive) {
                const responsiveSetting = config.responsive
                    .filter(({ breakpoint }) => window.innerWidth <= breakpoint)
                    .sort((a, b) => a.breakpoint - b.breakpoint)
                    .shift();

                if (responsiveSetting) {
                    slidesToShow = responsiveSetting.slidesToShow;
                } else {
                    slidesToShow = config.slidesToShow || 1;
                }
            } else {
                slidesToShow = config.slidesToShow || 1;
            }
        }

        function init() {
            updateSlidesToShow();
            totalSpan.textContent = items.length;
            updateSlider();
        }

        function updateSlider() {
            const visibleSlides = Math.min(slidesToShow, items.length);
            const slideWidthPercentage = 100 / visibleSlides;

            if (currentIndex > items.length - visibleSlides) {
                currentIndex = items.length - visibleSlides;
            }

            slider.style.transform = `translateX(-${(currentIndex * slideWidthPercentage)}%)`;

            currentSpan.textContent = Math.min(currentIndex + visibleSlides, items.length);
            totalSpan.textContent = items.length;
        }

        function startAutoScroll() {
            stopAutoScroll();
            if (config.autoScroll) {
                slideInterval = setInterval(() => {
                    if (currentIndex < items.length - slidesToShow) {
                        currentIndex++;
                    } else {
                        currentIndex = 0;
                    }
                    updateSlider();
                }, config.scrollSpeed || 3000);
            }
        }

        function stopAutoScroll() {
            clearInterval(slideInterval);
        }

        prevButton.addEventListener('click', () => {
            currentIndex = currentIndex > 0 ? currentIndex - 1 : items.length - slidesToShow;
            updateSlider();
            startAutoScroll();
        });

        nextButton.addEventListener('click', () => {
            currentIndex = currentIndex < items.length - slidesToShow ? currentIndex + 1 : 0;
            updateSlider();
            startAutoScroll();
        });

        window.addEventListener('resize', () => {
            const wasAutoScrollActive = !!slideInterval;
            stopAutoScroll();
            updateSlidesToShow();


            currentIndex = 0;
            updateSlider();

            if (window.innerWidth >= (config.deactivateOnResizeAt || 0) && wasAutoScrollActive) {
                startAutoScroll();
            }
        });

        init();
        startAutoScroll();

    }

    initSlider({
        selector: '.participants',
        slidesToShow: 3,
        autoScroll: false,
        scrollSpeed: 4000,
        responsive: [
            { breakpoint: 1180, slidesToShow: 2 },
            { breakpoint: 768, slidesToShow: 1 }
        ]
    });

});