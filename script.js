document.addEventListener("DOMContentLoaded", function () {

    const header = document.getElementById("header");
    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");
    const navLinks = document.querySelectorAll(".nav-link");

    /*
     * HEADER SCROLL
     */
    function handleHeader() {
        if (window.scrollY > 30) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }

    window.addEventListener("scroll", handleHeader);
    handleHeader();


    /*
     * MOBILE MENU
     */
    if (menuToggle && mainNav) {

        menuToggle.addEventListener("click", function () {

            const isOpen = mainNav.classList.toggle("open");

            document.body.classList.toggle("menu-open", isOpen);

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            menuToggle.innerHTML = isOpen
                ? '<i class="fas fa-xmark"></i>'
                : '<i class="fas fa-bars"></i>';
        });


        navLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                mainNav.classList.remove("open");
                document.body.classList.remove("menu-open");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.innerHTML =
                    '<i class="fas fa-bars"></i>';
            });

        });
    }


    /*
     * ACTIVE NAVIGATION
     */
    const sections = document.querySelectorAll("main section[id]");

    function updateActiveNav() {

        let current = "home";

        sections.forEach(function (section) {

            const sectionTop = section.offsetTop - 150;

            if (window.scrollY >= sectionTop) {
                current = section.getAttribute("id");
            }

        });

        navLinks.forEach(function (link) {

            link.classList.remove("active");

            const href = link.getAttribute("href");

            if (href === "#" + current) {
                link.classList.add("active");
            }

        });
    }

    window.addEventListener("scroll", updateActiveNav);
    updateActiveNav();


    /*
     * CURRENT YEAR
     */
    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }


    /*
     * CONTACT FORM
     *
     * Opens WhatsApp with the completed message.
     */
    const contactForm = document.getElementById("contactForm");
    const formStatus = document.getElementById("formStatus");

    if (contactForm) {

        contactForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const name =
                document.getElementById("name").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const service =
                document.getElementById("service").value.trim();

            const message =
                document.getElementById("message").value.trim();


            if (!name || !email || !service || !message) {

                if (formStatus) {
                    formStatus.textContent =
                        "Please complete all fields.";
                }

                return;
            }


            const whatsappMessage =
                "Hello PRIEST TECH!%0A%0A" +
                "Name: " + encodeURIComponent(name) +
                "%0AEmail: " + encodeURIComponent(email) +
                "%0AService: " + encodeURIComponent(service) +
                "%0A%0AMessage:%0A" +
                encodeURIComponent(message);


            const whatsappURL =
                "https://wa.me/231887328802?text=" +
                whatsappMessage;


            if (formStatus) {
                formStatus.textContent =
                    "Opening WhatsApp...";
            }


            window.open(
                whatsappURL,
                "_blank",
                "noopener,noreferrer"
            );

        });
    }


    /*
     * PRIEST AI
     */

    const aiInput = document.getElementById("aiInput");
    const sendAI = document.getElementById("sendAI");
    const aiChat = document.getElementById("aiChat");
    const aiStatus = document.getElementById("aiStatus");


    function addAIMessage(type, text) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "ai-message " + type;


        const avatar =
            document.createElement("div");

        avatar.className =
            "message-avatar";


        const avatarIcon =
            document.createElement("i");

        avatarIcon.className =
            type === "bot"
                ? "fas fa-robot"
                : "fas fa-user";


        avatar.appendChild(avatarIcon);


        const body =
            document.createElement("div");

        body.className =
            "message-body";


        const name =
            document.createElement("strong");

        name.textContent =
            type === "bot"
                ? "PRIEST AI"
                : "YOU";


        const paragraph =
            document.createElement("p");

        paragraph.textContent = text;


        body.appendChild(name);
        body.appendChild(paragraph);

        wrapper.appendChild(avatar);
        wrapper.appendChild(body);

        aiChat.appendChild(wrapper);

        aiChat.scrollTop =
            aiChat.scrollHeight;
    }


    function setAIStatus(status, busy = false) {

        if (!aiStatus) {
            return;
        }

        aiStatus.classList.toggle("busy", busy);

        const dot =
            aiStatus.querySelector("span");

        if (busy) {
            aiStatus.lastChild.textContent =
                " Thinking...";
        } else {
            aiStatus.lastChild.textContent =
                " " + status;
        }

        if (!dot) {
            aiStatus.innerHTML =
                "<span></span> " + status;
        }
    }


    function setAILoading(loading) {

        if (!sendAI) {
            return;
        }

        sendAI.disabled = loading;

        sendAI.innerHTML = loading
            ? '<i class="fas fa-spinner fa-spin"></i>'
            : '<i class="fas fa-paper-plane"></i>';

        setAIStatus(
            loading ? "Thinking..." : "Ready",
            loading
        );
    }


    async function sendMessage() {

        if (!aiInput || !aiChat) {
            return;
        }

        const message =
            aiInput.value.trim();


        if (!message) {
            return;
        }


        if (message.length > 4000) {

            addAIMessage(
                "bot",
                "Your message is too long. Please keep it under 4000 characters."
            );

            return;
        }


        addAIMessage("user", message);

        aiInput.value = "";

        aiInput.style.height = "auto";

        setAILoading(true);


        try {

            const response =
                await fetch("/api/chat", {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    })
                });


            let data;

            try {
                data = await response.json();
            } catch (jsonError) {

                throw new Error(
                    "The server returned an invalid response."
                );
            }


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "PRIEST AI could not process your request."
                );
            }


            if (!data.success || !data.reply) {

                throw new Error(
                    data.error ||
                    "PRIEST AI returned an empty response."
                );
            }


            addAIMessage(
                "bot",
                data.reply
            );


        } catch (error) {

            console.error(
                "PRIEST AI:",
                error
            );


            let errorMessage =
                "Sorry, PRIEST AI is temporarily unavailable. Please try again.";


            if (
                error.message &&
                error.message.toLowerCase().includes("failed to fetch")
            ) {

                errorMessage =
                    "I couldn't connect to the PRIEST AI server. Please make sure the website is deployed correctly.";

            } else if (
                error.message &&
                error.message.toLowerCase().includes("groq_api_key")
            ) {

                errorMessage =
                    "The PRIEST AI server needs its API configuration. Please check the Vercel environment variables.";

            } else if (
                error.message &&
                error.message.toLowerCase().includes("429")
            ) {

                errorMessage =
                    "PRIEST AI is temporarily busy. Please try again shortly.";
            }


            addAIMessage(
                "bot",
                errorMessage
            );

        } finally {

            setAILoading(false);
        }
    }


    if (sendAI) {

        sendAI.addEventListener(
            "click",
            sendMessage
        );

    }


    if (aiInput) {

        aiInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage();
                }

            }
        );


        aiInput.addEventListener(
            "input",
            function () {

                this.style.height = "auto";

                this.style.height =
                    Math.min(
                        this.scrollHeight,
                        130
                    ) + "px";

            }
        );

    }


    /*
     * SCROLL REVEAL
     */

    const revealElements =
        document.querySelectorAll(
            ".service-card, .project-card, .process-card, .team-card, .about-card, .contact-item"
        );


    revealElements.forEach(function (element) {
        element.classList.add("reveal");
    });


    const observer =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "visible"
                        );

                        observer.unobserve(
                            entry.target
                        );
                    }

                });

            },
            {
                threshold: 0.1
            }
        );


    revealElements.forEach(function (element) {
        observer.observe(element);
    });

});