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
        return;
    }
    selectors.planTrack.innerHTML = plans.map((plan) => buildPlanCard(plan)).join("");
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
    });
});

selectors.prevButton?.addEventListener("click", () => {
    selectors.planTrack?.scrollBy({ left: -320, behavior: "smooth" });
});

selectors.nextButton?.addEventListener("click", () => {
    selectors.planTrack?.scrollBy({ left: 320, behavior: "smooth" });
});

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

// Mobile menu toggle
const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const navLinks = document.getElementById("nav-links");

mobileMenuToggle?.addEventListener("click", () => {
    navLinks?.classList.toggle("active");
    mobileMenuToggle.classList.toggle("active");
});

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
    if (navLinks?.classList.contains("active") && 
        !navLinks.contains(e.target) && 
        !mobileMenuToggle?.contains(e.target)) {
        navLinks.classList.remove("active");
        mobileMenuToggle?.classList.remove("active");
    }
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

