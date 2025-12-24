const state = {
    plans: [],
    activeTab: "popular",
    selectedPlan: null,
};

const csrfTokenElement = document.querySelector('meta[name="csrf-token"]');
const csrfToken = csrfTokenElement ? csrfTokenElement.getAttribute('content') : '';

const endpoints = {
    plans: "/api/plans",
    inquiries: "/api/inquiries",
};

const selectors = {
    planTrack: document.getElementById("plan-track"),
    planTabs: document.querySelectorAll("[data-plan-tab]"),
    prevButton: document.getElementById("plans-prev"),
    nextButton: document.getElementById("plans-next"),
    installForm: document.getElementById("install-request-form"),
    installStatus: document.getElementById("install-status"),
    adminList: document.getElementById("admin-plan-list"),
    planForm: document.getElementById("plan-form"),
    formStatus: document.getElementById("form-status"),
    planId: document.getElementById("plan-id"),
    planName: document.getElementById("plan-name"),
    planDescription: document.getElementById("plan-description"),
    planPrice: document.getElementById("plan-price"),
    planCycle: document.getElementById("plan-cycle"),
    planType: document.getElementById("plan-type"),
    planPopular: document.getElementById("plan-popular"),
    resetButton: document.getElementById("reset-form"),
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

function formatCurrency(amount) {
    return currencyFormatter.format(Number(amount));
}

async function fetchPlans() {
    try {
        const response = await fetch(endpoints.plans, { credentials: "same-origin" });
        if (!response.ok) throw new Error("Failed to fetch plans");
        state.plans = await response.json();
        console.log("Plans loaded:", state.plans.length); // Debug log
        renderPlanCards();
        renderAdminList();
    } catch (error) {
        console.error(error);
        showStatus(selectors.formStatus, "Unable to load plans. Please refresh.", "error");
    }
}

function getFilteredPlans() {
    if (state.activeTab === "popular") {
        return state.plans.filter((plan) => plan.is_popular);
    }
    return state.plans;
}

function renderPlanCards() {
    if (!selectors.planTrack) return;
    const plans = getFilteredPlans();
    if (plans.length === 0) {
        selectors.planTrack.innerHTML = '<p class="muted-text">No plans available.</p>';
        // Hide slider buttons when no plans
        if (selectors.prevButton) selectors.prevButton.style.display = 'none';
        if (selectors.nextButton) selectors.nextButton.style.display = 'none';
        return;
    }
    selectors.planTrack.innerHTML = plans.map((plan) => buildPlanCard(plan)).join("");
    
    // Update slider buttons after rendering
    setTimeout(() => {
        updateSliderButtons();
    }, 100);
}

function buildPlanCard(plan) {
    const durationText = plan.billing_cycle || "Flexible billing";
    const offerText = plan.description || "Priority onboarding";
    const speedText = plan.plan_type === "recharge" ? "Unlimited fibre" : "Custom deployment";
    const priceSuffix = `<small>${durationText}</small>`;

    return `
        <article class="plan-card ${plan.is_popular ? "popular" : ""}">
            ${plan.is_popular ? '<span class="badge">Popular</span>' : ""}
            <p class="eyebrow">${plan.plan_type === "installation" ? "Installation plan" : "Recharge pack"}</p>
            <h3>${plan.name}</h3>
            <p class="price">${formatCurrency(plan.price)}${priceSuffix}</p>
            <ul class="plan-meta">
                <li><strong>Speed</strong><span>${speedText}</span></li>
                <li><strong>Duration</strong><span>${durationText}</span></li>
                <li><strong>Offer</strong><span>${offerText}</span></li>
            </ul>
            <button class="btn ghost select-plan" data-plan="${plan.id}">Select plan</button>
        </article>
    `;
}

function renderAdminList() {
    if (!selectors.adminList) return;
    selectors.adminList.innerHTML = state.plans
        .map(
            (plan) => `
        <div class="admin-plan-item">
            <div>
                <h4>${plan.name}</h4>
                <small>${plan.plan_type} • ${plan.billing_cycle} • ${formatCurrency(plan.price)}</small>
            </div>
            <div class="admin-actions">
                <button data-id="${plan.id}" class="edit">Edit</button>
                <button data-id="${plan.id}" class="delete">Delete</button>
            </div>
        </div>
    `,
        )
        .join("");

    selectors.adminList.querySelectorAll(".edit").forEach((button) => {
        button.addEventListener("click", () => populateForm(button.dataset.id));
    });

    selectors.adminList.querySelectorAll(".delete").forEach((button) => {
        button.addEventListener("click", () => handleDelete(button.dataset.id));
    });
}

function populateForm(planId) {
    const plan = state.plans.find((p) => String(p.id) === String(planId));
    if (!plan) return;
    selectors.planId.value = plan.id;
    selectors.planName.value = plan.name;
    selectors.planDescription.value = plan.description;
    selectors.planPrice.value = plan.price;
    selectors.planCycle.value = plan.billing_cycle;
    selectors.planType.value = plan.plan_type;
    selectors.planPopular.checked = !!plan.is_popular;
    showStatus(selectors.formStatus, `Ready to update "${plan.name}".`, "success");
}

async function handleDelete(planId) {
    if (!confirm("Delete this plan?")) return;

    try {
        const response = await fetch(`${endpoints.plans}/${planId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
            },
            credentials: "same-origin",
        });

        if (!response.ok) throw new Error("Delete failed");
        showStatus(selectors.formStatus, "Plan removed successfully.", "success");
        await fetchPlans();
    } catch (error) {
        console.error(error);
        showStatus(selectors.formStatus, "Unable to delete plan.", "error");
    }
}

function showStatus(element, message, variant = "") {
    if (!element) return;
    element.textContent = message;
    element.className = `status ${variant}`.trim();
}

if (selectors.planForm) {
    selectors.planForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const payload = {
            name: selectors.planName.value.trim(),
            description: selectors.planDescription.value.trim(),
            price: Number(selectors.planPrice.value),
            billing_cycle: selectors.planCycle.value.trim(),
            plan_type: selectors.planType.value,
            is_popular: selectors.planPopular.checked,
        };

        const planId = selectors.planId.value;
        const method = planId ? "PUT" : "POST";
        const url = planId ? `${endpoints.plans}/${planId}` : endpoints.plans;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
                },
                body: JSON.stringify(payload),
                credentials: "same-origin",
            });

            if (!response.ok) throw new Error("Save failed");

            showStatus(
                selectors.formStatus,
                `Plan ${planId ? "updated" : "created"} successfully.`,
                "success",
            );
            selectors.planForm.reset();
            selectors.planId.value = "";
            await fetchPlans();
        } catch (error) {
            console.error(error);
            showStatus(selectors.formStatus, "Unable to save plan.", "error");
        }
    });
}

if (selectors.resetButton) {
    selectors.resetButton.addEventListener("click", () => {
        selectors.planForm.reset();
        selectors.planId.value = "";
        showStatus(selectors.formStatus, "Form cleared.", "");
    });
}

selectors.planTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        state.activeTab = tab.dataset.planTab;
        selectors.planTabs.forEach((button) => button.classList.toggle("active", button === tab));
        renderPlanCards();
        
        // Reset slider position and update button states
        setTimeout(() => {
            if (selectors.planTrack) {
                selectors.planTrack.scrollLeft = 0;
            }
            updateSliderButtons();
        }, 100);
    });
});

// Auto-hide/show slider buttons based on scroll position and content
function updateSliderButtons() {
    if (!selectors.planTrack || !selectors.prevButton || !selectors.nextButton) {
        console.log("Missing slider elements"); // Debug log
        return;
    }
    
    const { scrollLeft, scrollWidth, clientWidth } = selectors.planTrack;
    const hasOverflow = scrollWidth > clientWidth;
    
    console.log("Slider debug:", { scrollLeft, scrollWidth, clientWidth, hasOverflow }); // Debug log
    
    // Show/hide buttons based on whether there's overflow content
    if (!hasOverflow) {
        selectors.prevButton.style.display = 'none';
        selectors.nextButton.style.display = 'none';
        return;
    } else {
        selectors.prevButton.style.display = 'flex';
        selectors.nextButton.style.display = 'flex';
    }
    
    // Update button states based on scroll position
    const isAtStart = scrollLeft <= 10;
    const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 10;
    
    console.log("Button states:", { isAtStart, isAtEnd }); // Debug log
    
    // Previous button
    selectors.prevButton.style.opacity = isAtStart ? '0.4' : '1';
    selectors.prevButton.style.pointerEvents = isAtStart ? 'none' : 'auto';
    selectors.prevButton.style.cursor = isAtStart ? 'default' : 'pointer';
    
    // Next button
    selectors.nextButton.style.opacity = isAtEnd ? '0.4' : '1';
    selectors.nextButton.style.pointerEvents = isAtEnd ? 'none' : 'auto';
    selectors.nextButton.style.cursor = isAtEnd ? 'default' : 'pointer';
}

// Enhanced slider navigation with better mobile support and smooth scrolling
selectors.prevButton?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!selectors.planTrack) return;
    
    console.log("Previous button clicked"); // Debug log
    
    const cardWidth = window.innerWidth < 768 ? 300 : 360;
    const scrollAmount = cardWidth + 20; // Card width + gap
    
    selectors.planTrack.scrollBy({ 
        left: -scrollAmount, 
        behavior: "smooth" 
    });
    
    // Update button states after scroll
    setTimeout(updateSliderButtons, 300);
});

selectors.nextButton?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!selectors.planTrack) return;
    
    console.log("Next button clicked"); // Debug log
    
    const cardWidth = window.innerWidth < 768 ? 300 : 360;
    const scrollAmount = cardWidth + 20; // Card width + gap
    
    selectors.planTrack.scrollBy({ 
        left: scrollAmount, 
        behavior: "smooth" 
    });
    
    // Update button states after scroll
    setTimeout(updateSliderButtons, 300);
});

selectors.planTrack?.addEventListener('scroll', updateSliderButtons);
window.addEventListener('resize', updateSliderButtons);

// Initialize button states
setTimeout(updateSliderButtons, 100);

selectors.planTrack?.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.classList.contains("select-plan")) {
        const planId = target.dataset.plan;
        const plan = state.plans.find((p) => String(p.id) === String(planId));
        
        if (plan) {
            state.selectedPlan = plan.name;
            const installForm = document.getElementById("install-form");
            if (installForm) {
                installForm.scrollIntoView({ behavior: "smooth" });
                
                const formTitle = installForm.querySelector("h3");
                if (formTitle) {
                    formTitle.textContent = `Get ${plan.name}`;
                    setTimeout(() => {
                        formTitle.textContent = "Get same-day installation";
                        state.selectedPlan = null;
                    }, 5000);
                }
            }
        }
    }
});

selectors.installForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span> Submitting...';
    
    const formData = {
        full_name: document.getElementById("full-name").value.trim(),
        phone: document.getElementById("phone-number").value.trim(),
        email: document.getElementById("email-id").value.trim(),
        pin_code: document.getElementById("pin-code").value.trim(),
        plan_interest: state.selectedPlan || "",
        preferred_time: document.getElementById("preferred-time").value,
        message: document.getElementById("message").value.trim(),
    };

    try {
        const response = await fetch(endpoints.inquiries, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Submission failed");

        showStatus(
            selectors.installStatus,
            "✅ Success! Our team will call you back soon. Check your email for confirmation.",
            "success"
        );
        selectors.installForm.reset();
        state.selectedPlan = null;
        
        setTimeout(() => {
            showStatus(selectors.installStatus, "", "");
        }, 8000);
    } catch (error) {
        console.error(error);
        showStatus(
            selectors.installStatus,
            "❌ Unable to submit. Please call us directly or try again.",
            "error"
        );
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});

// Coverage checker
const coverageForm = document.getElementById("coverage-form");
const coverageResult = document.getElementById("coverage-result");

coverageForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const pinCode = document.getElementById("coverage-pin").value.trim();
    
    // Simulate coverage check (in real app, this would be an API call)
    showStatus(coverageResult, "Checking coverage...", "");
    
    setTimeout(() => {
        // Mock logic - you can replace with actual API
        const availablePins = ["110001", "110002", "110003", "302001", "411001", "682001"];
        if (availablePins.includes(pinCode)) {
            showStatus(coverageResult, "✅ Great news! We serve your area. Book installation now!", "success");
        } else {
            showStatus(coverageResult, "📍 We're expanding! Leave your details and we'll notify you when available.", "");
        }
    }, 1500);
});

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href === "#") return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            
            // Close mobile menu if open
            const navLinks = document.getElementById("nav-links");
            const menuToggle = document.getElementById("mobile-menu-toggle");
            if (navLinks && navLinks.classList.contains("active")) {
                navLinks.classList.remove("active");
                menuToggle?.classList.remove("active");
            }
        }
    });
});

// Enhanced mobile menu with better animations
const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const navLinks = document.getElementById("nav-links");

mobileMenuToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isActive = navLinks?.classList.contains("active");
    
    if (isActive) {
        // Closing animation
        navLinks.style.animation = "slideUp 0.3s ease-out forwards";
        setTimeout(() => {
            navLinks?.classList.remove("active");
            navLinks.style.animation = "";
        }, 250);
    } else {
        // Opening animation
        navLinks?.classList.add("active");
        navLinks.style.animation = "slideDown 0.3s ease-out forwards";
    }
    
    mobileMenuToggle.classList.toggle("active");
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = isActive ? "" : "hidden";
});

// Enhanced outside click detection
document.addEventListener("click", (e) => {
    if (navLinks?.classList.contains("active") && 
        !navLinks.contains(e.target) && 
        !mobileMenuToggle?.contains(e.target)) {
        
        // Smooth close animation
        navLinks.style.animation = "slideUp 0.3s ease-out forwards";
        setTimeout(() => {
            navLinks.classList.remove("active");
            navLinks.style.animation = "";
            document.body.style.overflow = "";
        }, 250);
        
        mobileMenuToggle?.classList.remove("active");
    }
});

// Close menu when clicking nav links
navLinks?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        if (navLinks.classList.contains("active")) {
            navLinks.style.animation = "slideUp 0.3s ease-out forwards";
            setTimeout(() => {
                navLinks.classList.remove("active");
                navLinks.style.animation = "";
                document.body.style.overflow = "";
            }, 250);
            mobileMenuToggle?.classList.remove("active");
        }
    });
});

// Admin panel tabs
document.querySelectorAll(".admin-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        const tabName = tab.dataset.tab;
        
        // Update tabs
        document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        
        // Update content
        document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"));
        document.getElementById(`tab-${tabName}`)?.classList.add("active");
        
        // Save active tab to localStorage
        localStorage.setItem("activeAdminTab", tabName);
    });
});

// Restore active tab from localStorage
const savedTab = localStorage.getItem("activeAdminTab");
if (savedTab) {
    const tabButton = document.querySelector(`[data-tab="${savedTab}"]`);
    if (tabButton) {
        tabButton.click();
    }
}

// Collapsible sections
document.querySelectorAll(".section-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
        const section = toggle.dataset.section;
        const content = document.getElementById(`section-${section}`);
        
        toggle.classList.toggle("active");
        content?.classList.toggle("active");
    });
});

window.addEventListener("DOMContentLoaded", fetchPlans);


// Enhanced form validation with better mobile UX
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        const value = input.value.trim();
        const label = form.querySelector(`label[for="${input.id}"]`)?.textContent || input.placeholder;
        
        // Remove previous error states
        input.classList.remove('error');
        const existingError = input.parentNode.querySelector('.field-error');
        existingError?.remove();
        
        if (!value) {
            showFieldError(input, `${label} is required`);
            isValid = false;
        } else if (input.type === 'email' && !isValidEmail(value)) {
            showFieldError(input, 'Please enter a valid email address');
            isValid = false;
        } else if (input.type === 'tel' && !isValidPhone(value)) {
            showFieldError(input, 'Please enter a valid phone number');
            isValid = false;
        } else if (input.id === 'pin-code' && !isValidPinCode(value)) {
            showFieldError(input, 'Please enter a valid 6-digit PIN code');
            isValid = false;
        }
    });
    
    return isValid;
}

function showFieldError(input, message) {
    input.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: var(--danger);
        font-size: 0.875rem;
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: rgba(247, 37, 133, 0.1);
        border-radius: 0.5rem;
        border: 1px solid rgba(247, 37, 133, 0.3);
    `;
    input.parentNode.appendChild(errorDiv);
    
    // Scroll to first error on mobile
    if (window.innerWidth < 768) {
        setTimeout(() => {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[\+]?[0-9\s\-\(\)]{10,}$/.test(phone);
}

function isValidPinCode(pin) {
    return /^[0-9]{6}$/.test(pin);
}

// Enhanced install form with better validation
selectors.installForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    // Validate form
    if (!validateForm(selectors.installForm)) {
        return;
    }
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Enhanced loading state
    submitButton.disabled = true;
    submitButton.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div class="loading-spinner"></div>
            Submitting...
        </div>
    `;
    
    const formData = {
        full_name: document.getElementById("full-name").value.trim(),
        phone: document.getElementById("phone-number").value.trim(),
        email: document.getElementById("email-id").value.trim(),
        pin_code: document.getElementById("pin-code").value.trim(),
        plan_interest: state.selectedPlan || "",
        preferred_time: document.getElementById("preferred-time").value,
        message: document.getElementById("message").value.trim(),
    };

    try {
        const response = await fetch(endpoints.inquiries, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Submission failed");

        // Success animation
        submitButton.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--success);">✓</span>
                Success!
            </div>
        `;
        
        showStatus(
            selectors.installStatus,
            "🎉 Success! Our team will call you back soon. Check your email for confirmation.",
            "success"
        );
        
        selectors.installForm.reset();
        state.selectedPlan = null;
        
        // Auto-hide success message
        setTimeout(() => {
            showStatus(selectors.installStatus, "", "");
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }, 8000);
        
    } catch (error) {
        console.error(error);
        showStatus(
            selectors.installStatus,
            "❌ Unable to submit. Please call us directly or try again.",
            "error"
        );
        
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
});

// Enhanced coverage checker with better UX
const coverageFormElement = document.getElementById("coverage-form");
const coverageResultElement = document.getElementById("coverage-result");

coverageFormElement?.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const pinInput = document.getElementById("coverage-pin");
    const pinCode = pinInput.value.trim();
    
    if (!isValidPinCode(pinCode)) {
        showStatus(coverageResultElement, "Please enter a valid 6-digit PIN code", "error");
        pinInput.focus();
        return;
    }
    
    const submitBtn = coverageFormElement.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loading-spinner"></div> Checking...';
    
    showStatus(coverageResultElement, "Checking coverage in your area...", "");
    
    // Simulate API call with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
        // Mock coverage check - replace with actual API
        const availablePins = ["110001", "110002", "110003", "302001", "411001", "682001", "560001", "400001"];
        const isAvailable = availablePins.includes(pinCode);
        
        if (isAvailable) {
            showStatus(
                coverageResultElement, 
                "🎉 Great news! We serve your area. Book installation now!", 
                "success"
            );
        } else {
            showStatus(
                coverageResultElement, 
                "📍 We're expanding to your area soon! Leave your details and we'll notify you when available.", 
                ""
            );
        }
    } catch (error) {
        showStatus(coverageResultElement, "Unable to check coverage. Please try again.", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Enhanced smooth scrolling with mobile optimization
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href === "#") return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            
            // Calculate offset for mobile
            const offset = window.innerWidth < 768 ? 80 : 100;
            const targetPosition = target.offsetTop - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });
        }
    });
});

// Performance optimization: Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    lazyLoadImages();
    updateSliderButtons();
});

// Handle orientation changes on mobile
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        updateSliderButtons();
        // Recalculate slider positions
        if (selectors.planTrack) {
            selectors.planTrack.scrollLeft = 0;
        }
    }, 100);
});

// Add loading spinner styles dynamically
const spinnerStyles = `
    .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: currentColor;
        animation: spin 0.8s linear infinite;
    }
    
    .field-error {
        animation: slideInError 0.3s ease-out;
    }
    
    @keyframes slideInError {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
    
    input.error, textarea.error, select.error {
        border-color: var(--danger) !important;
        box-shadow: 0 0 0 4px rgba(247, 37, 133, 0.15) !important;
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = spinnerStyles;
document.head.appendChild(styleSheet);

// Enhanced touch/swipe support for mobile slider
let isDown = false;
let startX;
let scrollLeft;
let isDragging = false;

selectors.planTrack?.addEventListener('mousedown', (e) => {
    isDown = true;
    isDragging = false;
    startX = e.pageX - selectors.planTrack.offsetLeft;
    scrollLeft = selectors.planTrack.scrollLeft;
    selectors.planTrack.style.cursor = 'grabbing';
    selectors.planTrack.style.userSelect = 'none';
});

selectors.planTrack?.addEventListener('mouseleave', () => {
    isDown = false;
    selectors.planTrack.style.cursor = 'grab';
    selectors.planTrack.style.userSelect = '';
});

selectors.planTrack?.addEventListener('mouseup', () => {
    isDown = false;
    selectors.planTrack.style.cursor = 'grab';
    selectors.planTrack.style.userSelect = '';
    
    // Update button states after drag
    setTimeout(updateSliderButtons, 100);
});

selectors.planTrack?.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    isDragging = true;
    
    const x = e.pageX - selectors.planTrack.offsetLeft;
    const walk = (x - startX) * 2;
    selectors.planTrack.scrollLeft = scrollLeft - walk;
});

// Touch events for mobile with better performance
let touchStartX = 0;
let touchScrollLeft = 0;

selectors.planTrack?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].pageX;
    touchScrollLeft = selectors.planTrack.scrollLeft;
}, { passive: true });

selectors.planTrack?.addEventListener('touchmove', (e) => {
    if (!touchStartX) return;
    
    const x = e.touches[0].pageX;
    const walk = (touchStartX - x) * 1.5;
    selectors.planTrack.scrollLeft = touchScrollLeft + walk;
}, { passive: true });

selectors.planTrack?.addEventListener('touchend', () => {
    touchStartX = 0;
    setTimeout(updateSliderButtons, 100);
}, { passive: true });

// Improved scroll event handling with debouncing
let scrollTimeout;
selectors.planTrack?.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateSliderButtons, 50);
}, { passive: true });

// Handle window resize to recalculate slider state
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateSliderButtons();
        // Reset scroll position on significant resize
        if (selectors.planTrack && Math.abs(window.innerWidth - (window.lastWidth || window.innerWidth)) > 100) {
            selectors.planTrack.scrollLeft = 0;
        }
        window.lastWidth = window.innerWidth;
    }, 150);
});

// Prevent click events on plan cards when dragging
selectors.planTrack?.addEventListener('click', (e) => {
    if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
        return false;
    }
});