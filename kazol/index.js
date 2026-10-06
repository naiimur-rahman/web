document.addEventListener("DOMContentLoaded", function() {
    fetch("../api/notices.php")
        .then(res => res.json())
        .then(data => {
            if (data.success && data.notices && data.notices.length > 0) {
                const container = document.querySelector(".notice-cards");
                if (container) {
                    container.innerHTML = "";

                    data.notices.slice(0, 4).forEach(notice => {
                        const card = document.createElement("div");
                        card.className = "notice-card";
                        card.style.cursor = "pointer";
                        
                        card.innerHTML = `
                            <div class="card-top">
                                <div class="icon-placeholder">${notice.icon || '📢'}</div>
                                <span class="status-badge ${notice.badge_class || 'status-open'}">${notice.badge_text || 'Info'}</span>
                            </div>
                            <div class="notice-content index-ext-6">
                                <h5 class="index-ext-7">${notice.title}</h5>
                                <p class="index-ext-8">${notice.description}</p>
                            </div>
                        `;

                        card.addEventListener("click", function() {
                            alert(notice.title + "\n\n" + notice.description);
                        });

                        container.appendChild(card);
                    });
                }
            } else {
                attachFallbackListeners();
            }
        })
        .catch(err => {
            attachFallbackListeners();
        });

    let viewAll = document.querySelector(".view-all");
    if (viewAll) {
        viewAll.addEventListener("click", function(e) {
            e.preventDefault();
            fetch("../api/notices.php")
                .then(r => r.json())
                .then(data => {
                    if (data.success && data.notices.length > 0) {
                        let text = "All Notices:\n\n";
                        data.notices.forEach((n, i) => {
                            text += `${i+1}. ${n.title}\n${n.description}\n\n`;
                        });
                        alert(text);
                    } else {
                        alert("No notices available.");
                    }
                })
                .catch(() => alert("Could not load all notices."));
        });
    }

    try {
        const user = JSON.parse(localStorage.getItem("uiu_user"));
        if (user) {
            const loginBtn = document.querySelector(".login-btn");
            if (loginBtn) {
                loginBtn.innerText = "Dashboard";
                if (user.role === "student") loginBtn.href = "../tanjim/student_dashboard.html";
                else if (user.role === "faculty") loginBtn.href = "../naimur/dashboard.html";
                else if (user.role === "admin") loginBtn.href = "../bappy/admin-dashboard.html";
            }

            const avatar = document.querySelector(".avatar-placeholder");
            if (avatar) {
                avatar.innerText = (user.name || "U")[0].toUpperCase();
            }
        }
    } catch(e) {}
});

function attachFallbackListeners() {
    let cards = document.querySelectorAll(".notice-card");
    cards.forEach(function(card) {
        card.style.cursor = "pointer";
        card.addEventListener("click", function() {
            let title = card.querySelector("h5").innerText;
            let desc = card.querySelector("p").innerText;
            alert(title + "\n\n" + desc);
        });
    });
}
