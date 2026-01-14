document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. Welcome Popup Logic
       ===================================================== */
    const welcomeOverlay = document.getElementById("welcomeOverlay");
    const welcomeCloseBtn = document.getElementById("welcomeClose");

    if (welcomeOverlay && welcomeCloseBtn) {
        const isDismissed = localStorage.getItem("welcomeDismissed") === "true";

        if (!isDismissed) {
            welcomeOverlay.style.display = "flex";
        }

        welcomeCloseBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.setItem("welcomeDismissed", "true");
            window.location.href = "dex3.html";
        });
    }


    /* =====================================================
       2. Pricing → Telegram Redirect Logic
       ===================================================== */
    const TELEGRAM_URL = "https://t.me/Eriksen41"; // 🔴 CHANGE THIS
    const pricingButtons = document.querySelectorAll(".pricing-btn");

    pricingButtons.forEach((button) => {
        button.addEventListener("click", () => {

            const card = button.closest(".pricing-card");
            if (!card) return;

            // Extract plan details
            const planName = card.querySelector(".pricing-name")?.innerText || "N/A";
            const planPrice = card.querySelector(".pricing-price")?.innerText || "N/A";

            // Extract features
            const features = [...card.querySelectorAll(".pricing-features li:not(.disabled)")]
                .map(li => `• ${li.innerText.replace(/✔|✖/g, "").trim()}`)
                .join("\n");

            // Build Telegram message
            const message = `
📦 *Shipping Package Inquiry*

🛒 Package: *${planName}*
💲 Price: *${planPrice}*

✅ Features:
${features}

📩 Please assist me with this package.
            `.trim();

            // Encode message and open Telegram
            const telegramLink = `${TELEGRAM_URL}?text=${encodeURIComponent(message)}`;
            window.open(telegramLink, "_blank");
        });
    });


    /* =====================================================
       3. Footer Quick Links Smooth Scroll
       ===================================================== */
    const footerLinks = document.querySelectorAll(".footer-links a[href^='#']");
    footerLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href").substring(1);
            const targetEl = document.getElementById(targetId);

            if (targetEl) {
                targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });


    /* =====================================================
       4. Social Links Click Handler (Optional Analytics)
       ===================================================== */
    const socialLinks = document.querySelectorAll(".social-links a");
    socialLinks.forEach(link => {
        link.addEventListener("click", () => {
            const platform = link.querySelector("i")?.className || "unknown";
            console.log(`Social link clicked: ${platform}`);
            // TODO: Integrate with analytics here
        });
    });


    /* =====================================================
       5. Telegram Support Link Handler
       ===================================================== */
    const telegramLink = document.querySelector(".footer-links a[href*='t.me']");
    if (telegramLink) {
        telegramLink.addEventListener("click", () => {
            console.log("User clicked Telegram Support");
            telegramLink.setAttribute("target", "_blank");
        });
    }


    /* =====================================================
       6. Dynamic Footer Year Update
       ===================================================== */
    const footerYear = document.querySelector(".footer-bottom p:first-child");
    if (footerYear) {
        const currentYear = new Date().getFullYear();
        footerYear.innerHTML = footerYear.innerHTML.replace(/2024/, currentYear);
    }

});