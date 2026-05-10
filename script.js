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
const starsLayer = document.getElementById("starsLayer");

function setRandomStarPosition(star) {
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
}

function createStar(className, minDuration, maxDuration) {
    const star = document.createElement("span");
    star.classList.add("star", className);

    setRandomStarPosition(star);

    const duration = Math.random() * (maxDuration - minDuration) + minDuration;

    star.style.animationDuration = `${duration.toFixed(2)}s`;
    star.style.animationDelay = `-${(Math.random() * duration).toFixed(2)}s`;

    if (Math.random() < 0.05 && className !== "star--huge") {
        star.style.background = "rgba(255, 170, 90, 0.95)";
        star.style.boxShadow = "0 0 6px rgba(255,170,90,0.8), 0 0 14px rgba(255,170,90,0.35)";
    }

    star.addEventListener("animationiteration", function () {
        setRandomStarPosition(star);
    });

    starsLayer.appendChild(star);
}

for (let i = 0; i < 320; i++) {
    createStar("star--small", 0.45, 1.4);
}

for (let i = 0; i < 130; i++) {
    createStar("star--medium", 0.55, 1.6);
}

for (let i = 0; i < 70; i++) {
    createStar("star--large", 0.7, 1.9);
}

for (let i = 0; i < 16; i++) {
    createStar("star--huge", 0.9, 2.2);
}
const customCursor = document.querySelector(".custom-cursor");
const customCursorDot = document.querySelector(".custom-cursor__dot");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let cursorX = mouseX;
let cursorY = mouseY;

let dotX = 0;
let dotY = 0;

let targetDotX = 0;
let targetDotY = 0;

let lastMouseX = mouseX;
let lastMouseY = mouseY;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

document.addEventListener("mousemove", function (event) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    const moveX = mouseX - lastMouseX;
    const moveY = mouseY - lastMouseY;

    targetDotX = clamp(moveX * 0.22, -5, 5);
    targetDotY = clamp(moveY * 0.22, -5, 5);

    lastMouseX = mouseX;
    lastMouseY = mouseY;
});

function animateCursor() {
    cursorX = lerp(cursorX, mouseX, 0.42);
    cursorY = lerp(cursorY, mouseY, 0.42);

    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 10) {
        const scale = 10 / distance;

        cursorX = mouseX - dx * scale;
        cursorY = mouseY - dy * scale;
    }

    const dotMaxOffset = 8;

    const directionX = mouseX - cursorX;
    const directionY = mouseY - cursorY;
    const directionDistance = Math.sqrt(directionX * directionX + directionY * directionY);

    if (directionDistance > 0.1) {
        targetDotX = (directionX / directionDistance) * Math.min(directionDistance, dotMaxOffset);
        targetDotY = (directionY / directionDistance) * Math.min(directionDistance, dotMaxOffset);
    } else {
        targetDotX = 0;
        targetDotY = 0;
    }

    dotX = lerp(dotX, targetDotX, 0.22);
    dotY = lerp(dotY, targetDotY, 0.22);

    customCursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    customCursorDot.style.transform = `translate(calc(-50% + ${dotX}px), calc(-50% + ${dotY}px))`;

    requestAnimationFrame(animateCursor);
}

animateCursor();

document.querySelectorAll("a, button").forEach(function (element) {
    element.addEventListener("mouseenter", function () {
        customCursor.classList.add("custom-cursor--hover");
    });

    element.addEventListener("mouseleave", function () {
        customCursor.classList.remove("custom-cursor--hover");
    });
});