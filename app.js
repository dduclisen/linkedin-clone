const demoUserKey = "trabahe-demo-user";
const storedUser = localStorage.getItem(demoUserKey);
let currentUser = storedUser ? JSON.parse(storedUser) : null;

if (currentUser?.name) {
    document.querySelectorAll(".user-display-name").forEach((element) => {
        element.textContent = currentUser.name;
    });
}

function showFormMessage(form, message, isError = false) {
    const status = form.querySelector("[role='status']");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("error", isError);
}

document.querySelectorAll("[data-auth-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const values = new FormData(form);
        const email = String(values.get("email") || "").trim();
        const password = String(values.get("password") || "");
        if (form.dataset.authForm === "signup" && password !== values.get("confirmPassword")) {
            showFormMessage(form, "Those passwords do not match. Please try again.", true);
            form.elements.confirmPassword.focus();
            return;
        }

        const displayName = form.dataset.authForm === "signup"
            ? `${String(values.get("firstName")).trim()} ${String(values.get("lastName")).trim()}`
            : "Alex Morgan";
        currentUser = { name: displayName, email };
        localStorage.setItem(demoUserKey, JSON.stringify(currentUser));
        showFormMessage(form, "You're all set! Taking you to your feed…");
        window.setTimeout(() => { window.location.href = "index.html"; }, 500);
    });
});

document.querySelectorAll("[data-sign-out]").forEach((link) => {
    link.addEventListener("click", () => localStorage.removeItem(demoUserKey));
});

const profileMenu = document.getElementById("profileMenu");
const profileTrigger = document.querySelector(".profile-trigger");
if (profileMenu && profileTrigger) {
    profileTrigger.addEventListener("click", () => {
        const isOpen = profileMenu.classList.toggle("open-menu");
        profileTrigger.setAttribute("aria-expanded", String(isOpen));
    });
    document.addEventListener("click", (event) => {
        if (!profileMenu.contains(event.target) && !profileTrigger.contains(event.target)) {
            profileMenu.classList.remove("open-menu");
            profileTrigger.setAttribute("aria-expanded", "false");
        }
    });
}

const activity = document.getElementById("sidebarActivity");
const activityToggle = document.getElementById("showMoreLink");
if (activity && activityToggle) {
    activityToggle.addEventListener("click", () => {
        const isOpen = activity.classList.toggle("open-activity");
        activityToggle.innerHTML = isOpen ? "Show less <b>−</b>" : "Show more <b>+</b>";
    });
}

document.querySelectorAll("[data-action='connect'], [data-action='accept'], [data-action='save'], [data-action='apply'], [data-action='mark-read'], [data-action='like']").forEach((button) => {
    button.addEventListener("click", () => {
        const labels = {
            connect: ["Connect", "Pending"],
            accept: ["Accept", "Accepted"],
            save: ["Save", "Saved"],
            apply: ["Easy Apply", "Application started"],
            "mark-read": ["Mark as read", "Read"],
            like: ["Like", "Liked"]
        };
        const [initial, done] = labels[button.dataset.action];
        const active = button.getAttribute("aria-pressed") === "true";
        button.setAttribute("aria-pressed", String(!active));
        button.textContent = active ? initial : done;
        if (button.dataset.action === "mark-read") {
            const notification = button.closest(".notification-card");
            if (notification) notification.classList.remove("unread");
            if (button.closest(".page-heading")) {
                document.querySelectorAll(".notification-card.unread").forEach((card) => card.classList.remove("unread"));
            }
        }
    });
});

document.querySelectorAll("[data-action='dismiss']").forEach((button) => {
    button.addEventListener("click", () => button.closest(".invitation-row")?.remove());
});

document.querySelectorAll(".post-activity-link").forEach((control) => {
    const likeLabel = control.querySelector("span");
    if (!likeLabel || likeLabel.textContent.trim() !== "Like") return;
    control.setAttribute("role", "button");
    control.setAttribute("tabindex", "0");
    control.setAttribute("aria-pressed", "false");
    const toggleLike = () => {
        const active = control.getAttribute("aria-pressed") === "true";
        control.setAttribute("aria-pressed", String(!active));
        control.querySelector("span").textContent = active ? "Like" : "Liked";
    };
    control.addEventListener("click", toggleLike);
    control.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleLike();
        }
    });
});

document.querySelectorAll("[data-message-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = form.elements.message;
        const text = input.value.trim();
        if (!text) {
            input.setCustomValidity("Write a message before sending.");
            input.reportValidity();
            return;
        }
        input.setCustomValidity("");
        const message = document.createElement("p");
        message.className = "message-bubble outgoing";
        message.textContent = text;
        form.closest(".conversation").querySelector(".conversation-messages").append(message);
        input.value = "";
        input.focus();
    });
});

document.querySelectorAll("[data-post-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const textarea = form.querySelector("textarea");
        const text = textarea.value.trim();
        if (!text) {
            textarea.setCustomValidity("Add a note before sharing.");
            textarea.reportValidity();
            return;
        }
        textarea.setCustomValidity("");
        const post = document.createElement("article");
        post.className = "post";
        post.dataset.searchable = "";
        const author = document.createElement("strong");
        author.textContent = currentUser?.name || "Alex Morgan";
        const content = document.createElement("p");
        content.textContent = text;
        const time = document.createElement("small");
        time.textContent = "Just now · Visible to anyone";
        post.append(author, time, content);
        form.closest(".main-content").querySelector(".feed-list").prepend(post);
        textarea.value = "";
    });
});

document.querySelectorAll("[data-search-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = form.elements.search.value.trim().toLowerCase();
        const location = form.elements.location?.value || "anywhere";
        const cards = document.querySelectorAll("[data-searchable]");
        let visible = 0;
        cards.forEach((card) => {
            const content = card.textContent.toLowerCase();
            const matchesQuery = !query || content.includes(query);
            const matchesLocation = location === "anywhere" || content.includes(location);
            const match = matchesQuery && matchesLocation;
            card.hidden = !match;
            if (match) visible += 1;
        });
        const status = document.getElementById("searchStatus");
        if (status) status.textContent = query ? `${visible} results for “${query}”` : "Showing all results";
    });
});
