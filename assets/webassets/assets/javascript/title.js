let marqueeText = "^-^ Hello!! come Back  ";
let marqueeInterval;

function startMarquee() {
    marqueeInterval = setInterval(() => {
        document.title = marqueeText;
        marqueeText = marqueeText.substring(1) + marqueeText.substring(0, 1);
    }, 100);
}

function stopMarquee() {
    clearInterval(marqueeInterval);
    document.title = originalTitle;
}

// Beispiel: Marquee starten, wenn der User die Seite verlässt
window.addEventListener('blur', () => {
    startMarquee(); // Entferne "document.title = leaveTitle" oben, wenn du das nutzt
});

window.addEventListener('focus', () => {
    stopMarquee();
});