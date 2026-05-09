const cardsSlider = document.getElementById("cardsSlider");
const cardsTrack = document.getElementById("cardsTrack");
const sliderDotsContainer = document.getElementById("sliderDots");
const cardSlides = document.querySelectorAll(".card-slide");

let sliderDots = [];
let scrollTimer = null;
let isProgrammaticScroll = false;
let activeIndex = 0;

const anchorOffset = 190;

const perspectiveSizes = [
    { width: 230, height: 320, opacity: 1.00, skew: 10, fontSize: 42 },
    { width: 196, height: 286, opacity: 0.90, skew: 12, fontSize: 35 },
    { width: 168, height: 255, opacity: 0.80, skew: 14, fontSize: 30 },
    { width: 144, height: 226, opacity: 0.70, skew: 16, fontSize: 26 },
    { width: 124, height: 200, opacity: 0.60, skew: 18, fontSize: 22 },
    { width: 108, height: 178, opacity: 0.50, skew: 20, fontSize: 19 },
    { width: 94, height: 160, opacity: 0.42, skew: 22, fontSize: 17 },
    { width: 82, height: 145, opacity: 0.35, skew: 24, fontSize: 15 }
];

createDots();
selectCard(0, false);

function createDots() {
    sliderDotsContainer.innerHTML = "";

    cardSlides.forEach((slide, index) => {
        const dot = document.createElement("button");

        dot.classList.add("slider-dot");
        dot.type = "button";
        dot.dataset.slide = index;

        if (index === 0) {
            dot.classList.add("slider-dot--active");
        }

        dot.addEventListener("click", () => {
            selectCard(index, true);
        });

        sliderDotsContainer.appendChild(dot);
    });

    sliderDots = document.querySelectorAll(".slider-dot");
}
function selectCard(index, smooth = true) {
    activeIndex = index;

    clearTimeout(scrollTimer);

    setActiveDot(index);
    applyPerspectiveFrom(index);

    alignCardToAnchor(index, smooth);
}
function applyPerspectiveFrom(index) {
    cardSlides.forEach((slide, slideIndex) => {
        const placeholder = slide.querySelector(".card-placeholder");
        const depth = slideIndex - index;

        if (depth < 0) {
            slide.style.flexBasis = "82px";
            slide.style.height = "145px";
            slide.style.opacity = "0.18";

            if (placeholder) {
                placeholder.style.setProperty("--card-skew", "24px");
                placeholder.style.fontSize = "15px";
            }

            return;
        }

        const size = perspectiveSizes[Math.min(depth, perspectiveSizes.length - 1)];

        slide.style.flexBasis = `${size.width}px`;
        slide.style.height = `${size.height}px`;
        slide.style.opacity = size.opacity;

        if (placeholder) {
            placeholder.style.setProperty("--card-skew", `${size.skew}px`);
            placeholder.style.fontSize = `${size.fontSize}px`;
        }
    });
}
function setActiveDot(index) {
    sliderDots.forEach((dot, dotIndex) => {
        dot.classList.toggle("slider-dot--active", dotIndex === index);
    });
}
function alignCardToAnchor(index, smooth = true) {
    const maxScrollLeft = cardsSlider.scrollWidth - cardsSlider.clientWidth;

    const trackStyles = window.getComputedStyle(cardsTrack);
    const paddingLeft = parseFloat(trackStyles.paddingLeft) || 0;
    const gap = parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;

    const collapsedWidth = 82;

    const finalTargetOffset =
        paddingLeft +
        index * collapsedWidth +
        index * gap;

    let nextScrollLeft = finalTargetOffset - anchorOffset;

    nextScrollLeft = Math.max(0, Math.min(nextScrollLeft, maxScrollLeft));

    isProgrammaticScroll = true;

    cardsSlider.scrollTo({
        left: nextScrollLeft,
        behavior: smooth ? "smooth" : "auto"
    });

    scrollTimer = setTimeout(() => {
        isProgrammaticScroll = false;
    }, smooth ? 700 : 0);
}
function getClosestCardIndex() {
    const sliderRect = cardsSlider.getBoundingClientRect();
    const anchorX = sliderRect.left + anchorOffset;

    let closestIndex = 0;
    let closestDistance = Infinity;

    cardSlides.forEach((slide, index) => {
        const slideRect = slide.getBoundingClientRect();
        const distance = Math.abs(slideRect.left - anchorX);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    });

    return closestIndex;
}

cardsSlider.addEventListener("scroll", () => {
    if (isProgrammaticScroll) {
        return;
    }

    clearTimeout(scrollTimer);

    scrollTimer = setTimeout(() => {
        const index = getClosestCardIndex();

        if (index !== activeIndex) {
            activeIndex = index;
            setActiveDot(index);
            applyPerspectiveFrom(index);
        }
    }, 120);
});

window.addEventListener("resize", () => {
    alignCardToAnchor(activeIndex, false);
});