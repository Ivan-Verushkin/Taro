const cardsSlider = document.getElementById("cardsSlider");
const cardsTrack = document.getElementById("cardsTrack");
const sliderDotsContainer = document.getElementById("sliderDots");
const cardSlides = document.querySelectorAll(".card-slide");

let isDraggingCards = false;
let dragStartX = 0;
let dragStartScrollLeft = 0;
let hasDraggedCards = false;

cardsSlider.addEventListener("pointerdown", function (event) {
    isDraggingCards = true;
    hasDraggedCards = false;

    dragStartX = event.clientX;
    dragStartScrollLeft = cardsSlider.scrollLeft;

    cardsSlider.classList.add("is-dragging");
    cardsSlider.setPointerCapture(event.pointerId);
});

cardsSlider.addEventListener("pointermove", function (event) {
    if (!isDraggingCards) {
        return;
    }

    const moveX = event.clientX - dragStartX;

    if (Math.abs(moveX) > 5) {
        hasDraggedCards = true;
    }

    cardsSlider.scrollLeft = dragStartScrollLeft - moveX;
});

cardsSlider.addEventListener("pointerup", function (event) {
    if (!isDraggingCards) {
        return;
    }

    isDraggingCards = false;
    cardsSlider.classList.remove("is-dragging");

    try {
        cardsSlider.releasePointerCapture(event.pointerId);
    } catch (e) { }

    const index = getClosestCardIndex();

    activeIndex = index;
    setActiveDot(index);
    applyPerspectiveFrom(index);
    alignCardToAnchor(index, true);
});

cardsSlider.addEventListener("pointercancel", function () {
    isDraggingCards = false;
    cardsSlider.classList.remove("is-dragging");
});

let sliderDots = [];
let scrollTimer = null;
let isProgrammaticScroll = false;
let activeIndex = 0;

function getAnchorOffset() {
    return window.innerWidth <= 700 ? 24 : 190;
}

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
            if (window.innerWidth <= 700) {
                slide.style.display = "block";
                slide.style.visibility = "hidden";
                slide.style.flexBasis = "0px";
                slide.style.width = "0px";
                slide.style.height = "0px";
                slide.style.opacity = "0";
                slide.style.pointerEvents = "none";
                return;
            }
            slide.style.display = "block";
            slide.style.flexBasis = "82px";
            slide.style.height = "145px";
            slide.style.opacity = "0.18";

            if (placeholder) {
                placeholder.style.setProperty("--card-skew", "24px");
                placeholder.style.fontSize = "15px";
            }

            return;
        }

        slide.style.display = "block";
        slide.style.visibility = "visible";
        slide.style.pointerEvents = "auto";

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

    const collapsedWidth = window.innerWidth <= 700 ? 0 : 82;

    const finalTargetOffset =
        paddingLeft +
        index * collapsedWidth +
        index * gap;

    let nextScrollLeft = finalTargetOffset - getAnchorOffset();

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
    const anchorX = sliderRect.left + getAnchorOffset();

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
    if (isProgrammaticScroll || isDraggingCards) {
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
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");

            setTimeout(() => {
                entry.target.classList.add("was-shown");
            }, 1300);
        } else {
            entry.target.classList.remove("show");
        }
    });
}, {
    threshold: 0.2
});

const animatedElements = document.querySelectorAll(".hidden, .hidden-bottom");

animatedElements.forEach((el) => {
    observer.observe(el);
});

const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("timeline-show");
        } else {
            entry.target.classList.remove("timeline-show");
        }
    });
}, {
    threshold: 0.2
});

const timelineElements = document.querySelectorAll(".timeline .title, .timeline-item");

timelineElements.forEach((el) => {
    timelineObserver.observe(el);
});
const glowLayer = document.getElementById("glowLayer");

if (glowLayer) {
    const glows = [
        {
            left: "18%",
            top: "20%",
            size: "520px",
            opacity: "0.35",
            color1: "rgba(169, 108, 255, 0.55)",
            color2: "rgba(169, 108, 255, 0.18)"
        },
        {
            left: "82%",
            top: "25%",
            size: "460px",
            opacity: "0.28",
            color1: "rgba(235, 143, 6, 0.48)",
            color2: "rgba(235, 143, 6, 0.14)"
        },
        {
            left: "22%",
            top: "58%",
            size: "560px",
            opacity: "0.28",
            color1: "rgba(120, 70, 255, 0.5)",
            color2: "rgba(120, 70, 255, 0.16)"
        },
        {
            left: "78%",
            top: "68%",
            size: "520px",
            opacity: "0.25",
            color1: "rgba(255, 170, 80, 0.42)",
            color2: "rgba(255, 170, 80, 0.12)"
        },
        {
            left: "50%",
            top: "45%",
            size: "700px",
            opacity: "0.16",
            color1: "rgba(169, 108, 255, 0.45)",
            color2: "rgba(169, 108, 255, 0.1)"
        }
    ];

    glows.forEach((item) => {
        const glow = document.createElement("span");

        glow.classList.add("glow-spot");

        glow.style.setProperty("--glow-left", item.left);
        glow.style.setProperty("--glow-top", item.top);
        glow.style.setProperty("--glow-size", item.size);
        glow.style.setProperty("--glow-opacity", item.opacity);
        glow.style.setProperty("--glow-color-1", item.color1);
        glow.style.setProperty("--glow-color-2", item.color2);

        glow.style.setProperty("--move-x", `${Math.random() * 70 - 35}px`);
        glow.style.setProperty("--move-y", `${Math.random() * 70 - 35}px`);
        glow.style.setProperty("--glow-duration", `${Math.random() * 6 + 8}s`);

        glowLayer.appendChild(glow);
    });
}

const header = document.querySelector(".header");
const burger = header.querySelector(".burger-menu");
const burgerIcon = header.querySelector(".burger-menu__icon");
const nav = header.querySelector(".header__nav");

function hideMobileNav() {
    if (window.innerWidth <= 600) {
        nav.style.display = "none";
        header.classList.remove("header--mobile");
        burgerIcon.src = "Images/burger.svg";
    } else {
        nav.style.display = "flex";
        header.classList.remove("header--mobile");
        burgerIcon.src = "Images/burger.svg";
    }
}

hideMobileNav();

window.addEventListener("resize", hideMobileNav);

burger.addEventListener("click", function () {
    header.classList.toggle("header--mobile");

    if (header.classList.contains("header--mobile")) {
        nav.style.display = "flex";
        burgerIcon.src = "Images/burger-exit.svg";
    } else {
        nav.style.display = "none";
        burgerIcon.src = "Images/burger.svg";
    }
});