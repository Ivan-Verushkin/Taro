const cardsSlider = document.getElementById("cardsSlider");
const cardsTrack = document.getElementById("cardsTrack");
const sliderDotsContainer = document.getElementById("sliderDots");
const cardSlides = document.querySelectorAll(".card-slide");

let isDraggingCards = false;

let touchStartX = 0;
let touchStartY = 0;
let touchCurrentX = 0;
let touchCurrentY = 0;

let touchLocked = false;
let touchDirection = null;

const SWIPE_THRESHOLD = 35;
const DRAG_PREVIEW_LIMIT = 26;

cardsSlider.addEventListener("touchstart", function (event) {
    if (!event.touches || event.touches.length !== 1) {
        return;
    }

    isDraggingCards = true;
    touchLocked = false;
    touchDirection = null;

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchCurrentX = touchStartX;
    touchCurrentY = touchStartY;

    clearTimeout(scrollTimer);

    cardsSlider.classList.add("is-dragging");

    cardsTrack.style.transition = "none";
}, { passive: true });

cardsSlider.addEventListener("touchmove", function (event) {
    if (!isDraggingCards || !event.touches || event.touches.length !== 1) {
        return;
    }

    touchCurrentX = event.touches[0].clientX;
    touchCurrentY = event.touches[0].clientY;

    const diffX = touchCurrentX - touchStartX;
    const diffY = touchCurrentY - touchStartY;

    if (!touchLocked) {
        if (Math.abs(diffX) < 8 && Math.abs(diffY) < 8) {
            return;
        }

        touchDirection = Math.abs(diffX) > Math.abs(diffY) ? "horizontal" : "vertical";
        touchLocked = true;
    }

    if (touchDirection !== "horizontal") {
        return;
    }

    event.preventDefault();

    const previewOffset = Math.max(
        -DRAG_PREVIEW_LIMIT,
        Math.min(DRAG_PREVIEW_LIMIT, diffX * 0.22)
    );

    cardsTrack.style.transform = `translateX(${previewOffset}px)`;
}, { passive: false });

cardsSlider.addEventListener("touchend", function () {
    if (!isDraggingCards) {
        return;
    }

    isDraggingCards = false;
    cardsSlider.classList.remove("is-dragging");

    cardsTrack.style.transition = "transform 0.25s ease";
    cardsTrack.style.transform = "translateX(0)";

    setTimeout(() => {
        cardsTrack.style.transition = "";
        cardsTrack.style.transform = "";
    }, 260);

    if (touchDirection !== "horizontal") {
        return;
    }

    const diffX = touchCurrentX - touchStartX;

    if (Math.abs(diffX) < SWIPE_THRESHOLD) {
        selectCard(activeIndex, true);
        return;
    }

    const nextIndex = diffX < 0
        ? Math.min(activeIndex + 1, cardSlides.length - 1)
        : Math.max(activeIndex - 1, 0);

    selectCard(nextIndex, true);
}, { passive: true });

cardsSlider.addEventListener("touchcancel", function () {
    isDraggingCards = false;
    cardsSlider.classList.remove("is-dragging");

    cardsTrack.style.transition = "transform 0.25s ease";
    cardsTrack.style.transform = "translateX(0)";

    setTimeout(() => {
        cardsTrack.style.transition = "";
        cardsTrack.style.transform = "";
    }, 260);
}, { passive: true });

let mouseDraggingCards = false;
let mouseStartX = 0;
let mouseCurrentX = 0;

const MOUSE_SWIPE_THRESHOLD = 45;
const MOUSE_DRAG_PREVIEW_LIMIT = 32;

cardsSlider.addEventListener("mousedown", function (event) {
    if (window.innerWidth <= 700) {
        return;
    }

    mouseDraggingCards = true;
    mouseStartX = event.clientX;
    mouseCurrentX = event.clientX;

    clearTimeout(scrollTimer);

    cardsSlider.classList.add("is-dragging");
    cardsTrack.style.transition = "none";

    event.preventDefault();
});

window.addEventListener("mousemove", function (event) {
    if (!mouseDraggingCards) {
        return;
    }

    mouseCurrentX = event.clientX;

    const diffX = mouseCurrentX - mouseStartX;

    const previewOffset = Math.max(
        -MOUSE_DRAG_PREVIEW_LIMIT,
        Math.min(MOUSE_DRAG_PREVIEW_LIMIT, diffX * 0.18)
    );

    cardsTrack.style.transform = `translateX(${previewOffset}px)`;
});

window.addEventListener("mouseup", function () {
    if (!mouseDraggingCards) {
        return;
    }

    mouseDraggingCards = false;
    cardsSlider.classList.remove("is-dragging");

    cardsTrack.style.transition = "transform 0.25s ease";
    cardsTrack.style.transform = "translateX(0)";

    setTimeout(() => {
        cardsTrack.style.transition = "";
        cardsTrack.style.transform = "";
    }, 260);

    const diffX = mouseCurrentX - mouseStartX;

    if (Math.abs(diffX) < MOUSE_SWIPE_THRESHOLD) {
        selectCard(activeIndex, true);
        return;
    }

    const nextIndex = diffX < 0
        ? Math.min(activeIndex + 1, cardSlides.length - 1)
        : Math.max(activeIndex - 1, 0);

    selectCard(nextIndex, true);
});

let sliderDots = [];
let scrollTimer = null;
let isProgrammaticScroll = false;
let activeIndex = 0;

function getAnchorOffset() {
    return window.innerWidth <= 700 ? 24 : 190;
}

const perspectiveSizes = [
    { width: 230, height: 355, opacity: 1.00, rotate: 0, z: 0 },
    { width: 205, height: 330, opacity: 0.92, rotate: -8, z: -20 },
    { width: 180, height: 300, opacity: 0.82, rotate: -13, z: -45 },
    { width: 158, height: 270, opacity: 0.72, rotate: -17, z: -70 },
    { width: 138, height: 240, opacity: 0.62, rotate: -20, z: -95 },
    { width: 120, height: 215, opacity: 0.52, rotate: -23, z: -120 },
    { width: 104, height: 190, opacity: 0.42, rotate: -26, z: -145 },
    { width: 92, height: 170, opacity: 0.35, rotate: -28, z: -165 }
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
                slide.style.transform = "none";
                return;
            }

            slide.style.display = "block";
            slide.style.visibility = "visible";
            slide.style.flexBasis = "90px";
            slide.style.height = "155px";
            slide.style.opacity = "0.18";
            slide.style.pointerEvents = "auto";
            slide.style.transform = "rotateY(18deg) translateZ(-170px)";

            return;
        }

        slide.style.display = "block";
        slide.style.visibility = "visible";
        slide.style.pointerEvents = "auto";

        const size = perspectiveSizes[Math.min(depth, perspectiveSizes.length - 1)];

        slide.style.flexBasis = `${size.width}px`;
        slide.style.height = `${size.height}px`;
        slide.style.opacity = size.opacity;

        slide.style.transform = `rotateY(${size.rotate}deg) translateZ(${size.z}px)`;
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

    const collapsedWidth = window.innerWidth <= 700 ? 0 : 90;
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

if (window.innerWidth > 1200) {
    animateCursor();
}

if (window.innerWidth > 1200) {
    document.querySelectorAll("a, button").forEach(function (element) {
        element.addEventListener("mouseenter", function () {
            customCursor.classList.add("custom-cursor--hover");
        });

        element.addEventListener("mouseleave", function () {
            customCursor.classList.remove("custom-cursor--hover");
        });
    });
}
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