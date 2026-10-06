
const API = "../api";

function getUser() {
    try {
        return JSON.parse(localStorage.getItem("uiu_user")) || null;
    } catch (e) {
        return null;
    }
}

function requireStudentLogin() {
    const user = getUser();
    if (!user) {
        window.location.href = "../kazol/login.html";
        return null;
    }
    if (user.role !== "student") {
        alert("Access denied. This page is for students only.");
        window.location.href = "../kazol/login.html";
        return null;
    }
    
    fetch(`${API}/auth.php`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) {
                localStorage.removeItem("uiu_user");
                window.location.href = "../kazol/login.html";
            }
        }).catch(() => {});
        
    return user;
}

function updateSidebar(user) {
    if (!user) return;

    const nameEl = document.querySelector(".student-name");
    const idEl   = document.querySelector(".student-id");
    const iconEl = document.querySelector(".profile-icon");

    if (nameEl) nameEl.textContent = user.name || "Student";
    if (idEl)   idEl.textContent   = user.university_id || user.username;
    
    if (iconEl) {
        if (user.profile_picture && user.profile_picture !== 'default.png') {
            iconEl.innerHTML = `<img src="../uploads/profiles/${user.profile_picture}" 
                style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            iconEl.style.fontSize = "0";
        } else {
            iconEl.textContent = (user.name || "S").charAt(0).toUpperCase();
        }
    }
}

function showNotice(message, type = "success") {
    let notice = document.getElementById("js-notice");
    if (!notice) {
        notice = document.createElement("div");
        notice.id = "js-notice";
        notice.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 9999;
            padding: 12px 20px; border-radius: 8px; font-size: 14px;
            font-weight: 600; color: #fff; max-width: 350px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: opacity 0.4s;
        `;
        document.body.appendChild(notice);
    }
    notice.style.background = type === "success" ? "#2e7d32" : (type === "error" ? "#c62828" : "#17437a");
    notice.textContent = message;
    notice.style.opacity = "1";
    notice.style.display = "block";

    setTimeout(() => {
        notice.style.opacity = "0";
        setTimeout(() => notice.style.display = "none", 400);
    }, 3500);
}

function logout() {
    localStorage.removeItem("uiu_user");
    fetch(`${API}/auth.php?action=logout`).finally(() => {
        window.location.href = "../kazol/login.html";
    });
}

document.querySelectorAll(".logout a, .logout").forEach(el => {
    if (el.tagName === "A") {
        el.addEventListener("click", function(e) {
            e.preventDefault();
            logout();
        });
    }
});

function initDashboard(user) {
    const welcomeH2 = document.querySelector(".welcome h2");
    if (welcomeH2) welcomeH2.textContent = `Welcome back, ${user.name}!`;

    fetch(`${API}/stats.php?role=student&student_id=${user.id}`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            const s = data.stats;

            const statNumbers = document.querySelectorAll(".stat .stat-number");
            const statStatuses = document.querySelectorAll(".stat .stat-status");

            if (statNumbers[0]) statNumbers[0].textContent = String(s.total_applications).padStart(2, "0");
            if (statNumbers[1]) statNumbers[1].textContent = String(s.shortlisted).padStart(2, "0");
            if (statNumbers[2]) statNumbers[2].textContent = String(s.interviews).padStart(2, "0");
            if (statNumbers[3]) statNumbers[3].textContent = String(s.selected > 0 ? 1 : 0).padStart(2, "0");

            if (statStatuses[0]) statStatuses[0].textContent = `${s.pending} Pending`;
            if (statStatuses[1]) statStatuses[1].textContent = `${s.interviews} Interview Pending`;
            if (statStatuses[2]) statStatuses[2].textContent = `${s.interviews} Upcoming`;
            if (statStatuses[3]) statStatuses[3].textContent = `${s.selected} Active`;
        })
        .catch(() => { });

    fetch(`${API}/vacancies.php?status=Open`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            const positionRow = document.querySelector(".position-row");
            if (!positionRow) return;

            const borderColors = ["blue-border", "green-border", "orange-border", "purple-border"];
            positionRow.innerHTML = "";

            const vacancies = data.vacancies.slice(0, 3);
            if (vacancies.length === 0) {
                positionRow.innerHTML = "<p style='color:#888; padding:10px;'>No open positions available.</p>";
                return;
            }

            vacancies.forEach((v, i) => {
                const deadlineStr = v.deadline ? new Date(v.deadline).toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"}) : "N/A";
                const card = document.createElement("div");
                card.className = "position-card";
                card.innerHTML = `
                    <h3>${v.course_title}</h3>
                    <p>Instructor: ${v.instructor_name}</p>
                    <p>Course: ${v.course_code}</p>
                    <div class="details">
                        <span>${v.positions} Vacancies</span>
                        <span>${deadlineStr}</span>
                    </div>
                    <a href="apply.html?vacancy_id=${v.id}" class="apply-button">Apply</a>
                `;
                positionRow.appendChild(card);
            });
        })
        .catch(() => { });

    fetch(`${API}/applications.php?student_id=${user.id}`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            const tbody = document.querySelector("table tbody") || document.querySelector("table");
            if (!tbody) return;

            const table = document.querySelector("table");
            if (!table) return;

            const rows = table.querySelectorAll("tbody tr");
            rows.forEach(r => r.remove());

            let tBody = table.querySelector("tbody");
            if (!tBody) {
                tBody = document.createElement("tbody");
                table.appendChild(tBody);
            }

            const apps = data.applications.slice(0, 5);
            if (apps.length === 0) {
                tBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#888; padding:20px;">No applications yet.</td></tr>`;
                return;
            }

            apps.forEach(app => {
                const dateStr = app.applied_at ? new Date(app.applied_at).toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"}) : "N/A";
                const statusClass = getStatusClass(app.status);
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${app.course_title || "TA Position"}</td>
                    <td>${dateStr}</td>
                    <td><span class="status ${statusClass}">${app.status}</span></td>
                `;
                tBody.appendChild(tr);
            });
        })
        .catch(() => { });
        
    fetch(`${API}/notices.php`)
        .then(r => r.json())
        .then(data => {
            const container = document.getElementById("dashboard-notices");
            if (!container) return;
            if (data.success && data.notices.length > 0) {
                container.innerHTML = "";
                data.notices.slice(0, 3).forEach(n => {
                    container.innerHTML += `<div style="padding:10px; border-bottom:1px solid #eee;">
                        <strong style="color:#17437a; font-size:14px;">${n.icon||'📢'} ${n.title}</strong>
                        <p style="font-size:12px; color:#666; margin:4px 0 0 0;">${n.description}</p>
                    </div>`;
                });
            } else {
                container.innerHTML = "<p style='color:#888; font-size:13px;'>No new notices.</p>";
            }
        });
        
    Promise.all([
        fetch(`${API}/vacancies.php?status=Open`).then(r => r.json()),
        fetch(`${API}/tasks.php?student_id=${user.id}`).then(r => r.json())
    ]).then(([vacData, taskData]) => {
        const container = document.getElementById("dashboard-deadlines");
        if (!container) return;
        
        let deadlines = [];
        if (vacData.success) {
            vacData.vacancies.forEach(v => {
                if (v.deadline) deadlines.push({ date: new Date(v.deadline), text: `Application: ${v.course_code}` });
            });
        }
        if (taskData.success) {
            taskData.tasks.filter(t => t.status === 'Pending').forEach(t => {
                if (t.deadline) deadlines.push({ date: new Date(t.deadline), text: `Task: ${t.title}` });
            });
        }
        
        deadlines.sort((a,b) => a.date - b.date);
        
        if (deadlines.length > 0) {
            container.innerHTML = "";
            deadlines.slice(0, 4).forEach(d => {
                const isPast = d.date < new Date();
                const color = isPast ? '#c62828' : '#2e7d32';
                container.innerHTML += `<div style="padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between;">
                    <span style="font-size:13px; font-weight:600; color:#333;">${d.text}</span>
                    <span style="font-size:12px; font-weight:bold; color:${color};">${d.date.toLocaleDateString()}</span>
                </div>`;
            });
        } else {
            container.innerHTML = "<p style='color:#888; font-size:13px;'>No upcoming deadlines.</p>";
        }
    });
}

function getStatusClass(status) {
    const map = {
        "Pending": "review",
        "Reviewed": "review",
        "Shortlisted": "shortlisted",
        "Interview Scheduled": "interview",
        "Selected": "selected",
        "Rejected": "rejected"
    };
    return map[status] || "review";
}

function initProfile(user) {
    function renderProfile(data) {
        const largeAvatar = document.getElementById("avatar-container");
        if (largeAvatar) {
            if (data.profile_picture && data.profile_picture !== 'default.png') {
                largeAvatar.innerHTML = `<img src="../uploads/profiles/${data.profile_picture}" alt="Profile">`;
                largeAvatar.style.background = "none";
                largeAvatar.style.border = "none";
            } else {
                largeAvatar.innerHTML = (data.name || "S").charAt(0).toUpperCase();
            }
        }
        
        updateSidebar(data);

        const dispName = document.getElementById("disp-name");
        if (dispName) dispName.textContent = data.name || "Student";
        
        const dispId = document.getElementById("disp-id");
        if (dispId) dispId.textContent = `Student ID: ${data.university_id || "N/A"}`;
        
        const dispDept = document.getElementById("disp-dept");
        if (dispDept) dispDept.textContent = `${data.department || "CSE"} • Active Student`;

        if(document.getElementById("val-name")) document.getElementById("val-name").textContent = data.name || "N/A";
        if(document.getElementById("val-uid")) document.getElementById("val-uid").textContent = data.university_id || "N/A";
        if(document.getElementById("val-email")) document.getElementById("val-email").textContent = data.email || "N/A";
        if(document.getElementById("val-phone")) document.getElementById("val-phone").textContent = data.phone || "Not Provided";
        if(document.getElementById("val-address")) document.getElementById("val-address").textContent = data.address || "Not Provided";
        if(document.getElementById("val-program")) document.getElementById("val-program").textContent = data.program || "Not Provided";
        if(document.getElementById("val-dept")) document.getElementById("val-dept").textContent = data.department || "N/A";
        if(document.getElementById("val-semester")) document.getElementById("val-semester").textContent = data.semester || "N/A";
        if(document.getElementById("val-cgpa")) document.getElementById("val-cgpa").textContent = data.cgpa || "N/A";
        
        document.querySelector("input[name='name']").value = data.name || "";
        document.querySelector("input[name='university_id']").value = data.university_id || "";
        document.querySelector("input[name='email']").value = data.email || "";
        document.querySelector("input[name='phone']").value = data.phone || "";
        document.querySelector("input[name='address']").value = data.address || "";
        document.querySelector("input[name='program']").value = data.program || "";
        document.querySelector("input[name='department']").value = data.department || "";
        document.querySelector("input[name='semester']").value = data.semester || "";
        if(document.querySelector("input[name='cgpa']")) document.querySelector("input[name='cgpa']").value = data.cgpa || "";
        
        localStorage.setItem("uiu_user", JSON.stringify(data));
    }

    fetch(`${API}/profile.php`)
        .then(r => r.json())
        .then(data => {
            if(data.success) renderProfile(data.profile);
        });
        
    fetch(`${API}/applications.php?student_id=${user.id}&status=Selected`)
        .then(r => r.json())
        .then(data => {
            if (data.success && data.applications.length > 0) {
                const app = data.applications[0];
                if(document.getElementById("ta-course")) document.getElementById("ta-course").textContent = app.course_title;
                if(document.getElementById("ta-code")) document.getElementById("ta-code").textContent = app.course_code;
                if(document.getElementById("ta-faculty")) document.getElementById("ta-faculty").textContent = app.instructor_name;
                const statusEl = document.getElementById("ta-status");
                if(statusEl) { statusEl.textContent = "Active"; statusEl.className = "active-status"; statusEl.style.color = "#2e7d32"; }
            }
        });

    const editBtn = document.getElementById("edit-profile-btn");
    const saveBtn = document.getElementById("save-profile-btn");
    
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            document.querySelectorAll(".disp-field").forEach(el => el.style.display = "none");
            document.querySelectorAll(".edit-field").forEach(el => el.style.display = "block");
            editBtn.style.display = "none";
            saveBtn.style.display = "block";
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            saveBtn.textContent = "Saving...";
            const fd = new FormData(document.getElementById("profile-form"));
            const obj = {};
            fd.forEach((value, key) => obj[key] = value);
            
            fetch(`${API}/profile.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(obj)
            })
            .then(r => r.json())
            .then(res => {
                if(res.success) {
                    showNotice("Profile updated successfully");
                    renderProfile(res.profile);
                    
                    document.querySelectorAll(".disp-field").forEach(el => el.style.display = "block");
                    document.querySelectorAll(".edit-field").forEach(el => el.style.display = "none");
                    saveBtn.style.display = "none";
                    editBtn.style.display = "block";
                    saveBtn.textContent = "Save Profile";
                } else {
                    showNotice(res.message, "error");
                    saveBtn.textContent = "Save Profile";
                }
            });
        });
    }

    const avatarContainer = document.getElementById("avatar-container");
    const fileInput = document.getElementById("profile-upload");
    if (avatarContainer && fileInput) {
        avatarContainer.addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", function() {
            if(!this.files || !this.files[0]) return;
            const fd = new FormData();
            fd.append("profile_picture", this.files[0]);
            
            avatarContainer.style.opacity = "0.5";
            fetch(`${API}/profile.php`, {
                method: "POST",
                body: fd
            })
            .then(r => r.json())
            .then(res => {
                avatarContainer.style.opacity = "1";
                if(res.success) {
                    showNotice("Profile picture updated");
                    avatarContainer.innerHTML = `<img src="../uploads/profiles/${res.profile_picture}" alt="Profile">`;
                    avatarContainer.style.background = "none";
                    avatarContainer.style.border = "none";
                    
                    const sidebarAvatar = document.querySelector(".profile-icon");
                    if (sidebarAvatar) {
                        sidebarAvatar.innerHTML = `<img src="../uploads/profiles/${res.profile_picture}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
                    }
                } else {
                    showNotice(res.message, "error");
                }
            });
        });
    }
}

function initPositions(user) {
    const positionList = document.querySelector(".position-list");
    if (!positionList) return;

    positionList.innerHTML = "<p style='padding:20px; color:#888;'>Loading positions...</p>";

    fetch(`${API}/vacancies.php`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) {
                positionList.innerHTML = "<p style='padding:20px; color:#888;'>Unable to load positions.</p>";
                return;
            }

            const vacancies = data.vacancies;
            if (vacancies.length === 0) {
                positionList.innerHTML = "<p style='padding:20px; color:#888;'>No TA positions are currently available.</p>";
                return;
            }

            const borderColors = ["blue-border", "green-border", "orange-border", "purple-border"];
            positionList.innerHTML = "";

            vacancies.forEach((v, i) => {
                const deadlineStr = v.deadline
                    ? new Date(v.deadline).toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"})
                    : "N/A";
                const borderClass = borderColors[i % borderColors.length];
                const isOpen = v.status === "Open" || v.status === "Reviewing";

                const card = document.createElement("div");
                card.className = `position-card ${borderClass}`;
                card.innerHTML = `
                    <div class="position-left">
                        <h2>${v.course_title}</h2>
                        <p>Instructor: <b>${v.instructor_name}</b></p>
                        <p>Course: <b>${v.course_code}</b></p>
                        <div class="tags">
                            <span class="tag blue-tag">${v.term || "Fall 2026"}</span>
                            <span class="tag green-tag">${v.positions} Vacancies</span>
                            ${v.status !== "Open" ? `<span class="tag" style="background:#fff3e0; color:#e65100;">${v.status}</span>` : ""}
                        </div>
                        ${v.responsibilities ? `<p style="font-size:13px; color:#555; margin-top:8px;">${v.responsibilities.substring(0, 100)}${v.responsibilities.length > 100 ? "..." : ""}</p>` : ""}
                    </div>
                    <div class="position-right">
                        <div class="deadline">Application Deadline</div>
                        <div class="date">${deadlineStr}</div>
                        <div style="font-size:12px; color:#888; margin:4px 0;">Min CGPA: ${v.min_cgpa}</div>
                        ${isOpen
                            ? `<a href="apply.html?vacancy_id=${v.id}" class="apply">Apply Now</a>`
                            : `<span style="display:block; text-align:center; padding:8px; background:#eee; border-radius:6px; font-size:13px; color:#888;">Closed</span>`
                        }
                    </div>
                `;
                positionList.appendChild(card);
            });

            const searchInput = document.getElementById("positionSearch");
            if (searchInput) {
                searchInput.addEventListener("input", function() {
                    const filter = this.value.toLowerCase();
                    document.querySelectorAll(".position-card").forEach(card => {
                        card.style.display = card.innerText.toLowerCase().includes(filter) ? "" : "none";
                    });
                });
            }
        })
        .catch(() => {
            positionList.innerHTML = "<p style='padding:20px; color:#c00;'>Unable to load positions. Please check your connection.</p>";
        });
}

function initApply(user) {
    const form = document.getElementById("apply-form");
    if (!form) return;

    const nameInput   = document.getElementById("student-name");
    const idInput     = document.getElementById("student-uni-id");
    const cgpaInput   = document.getElementById("student-cgpa");
    const motivInput  = document.getElementById("motivation");
    const skillsInput = document.getElementById("skills");
    const select      = document.getElementById("vacancy-select");

    if (nameInput)  { nameInput.value  = user.name           || ""; }
    if (idInput)    { idInput.value    = user.university_id  || ""; }
    if (cgpaInput)  { cgpaInput.value  = user.cgpa           || ""; }

    if (select) {
        const urlParams     = new URLSearchParams(window.location.search);
        const preSelectedId = urlParams.get("vacancy_id");

        fetch(`${API}/vacancies.php?status=Open`)
            .then(r => r.json())
            .then(data => {
                if (!data.success || data.vacancies.length === 0) {
                    select.innerHTML = '<option value="">No open positions available</option>';
                    return;
                }
                select.innerHTML = '<option value="">Select a position</option>';
                data.vacancies.forEach(v => {
                    const opt = document.createElement("option");
                    opt.value = v.id;
                    opt.textContent = `${v.course_title} (${v.course_code})`;
                    if (preSelectedId && v.id == preSelectedId) opt.selected = true;
                    select.appendChild(opt);
                });
            })
            .catch(() => {
                select.innerHTML = '<option value="">Failed to load positions</option>';
            });
    }

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const vacancyId = select ? parseInt(select.value) : 0;
        if (!vacancyId) {
            showNotice("Please select a position!", "error");
            return;
        }

        const motivation = motivInput  ? motivInput.value.trim()  : "";
        const skills     = skillsInput ? skillsInput.value.trim() : "";

        if (!motivation) {
            showNotice("Please write your motivation!", "error");
            return;
        }
        if (!skills) {
            showNotice("Please list your relevant skills!", "error");
            return;
        }

        const submitBtn = document.getElementById("submit-btn");
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Submitting..."; }
        
        const finalCgpa = cgpaInput && cgpaInput.value ? parseFloat(cgpaInput.value) : (parseFloat(user.cgpa) || 0);

        fetch(`${API}/applications.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                vacancy_id:     vacancyId,
                student_id:     user.id,
                student_name:   user.name,
                student_uni_id: user.university_id,
                email:          user.email,
                cgpa:           finalCgpa,
                motivation:     motivation,
                skills:         skills
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showNotice("Application submitted successfully!");
                setTimeout(() => window.location.href = "my_applications.html", 1500);
            } else {
                showNotice(data.message || "Failed to submit application", "error");
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Submit Application"; }
            }
        })
        .catch(() => {
            showNotice("Network error. Please try again.", "error");
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Submit Application"; }
        });
    });
}

function initMyApplications(user) {
    const panel = document.querySelector(".panel");
    if (!panel) return;

    panel.querySelectorAll(".application-card").forEach(c => c.remove());

    const bottomBtn = panel.querySelector(".bottom-button");

    const loadingEl = document.createElement("p");
    loadingEl.style.cssText = "color:#888; padding:10px;";
    loadingEl.textContent = "Loading your applications...";
    if (bottomBtn) {
        panel.insertBefore(loadingEl, bottomBtn);
    } else {
        panel.appendChild(loadingEl);
    }

    fetch(`${API}/applications.php?student_id=${user.id}`)
        .then(r => r.json())
        .then(data => {
            loadingEl.remove();

            if (!data.success) {
                const err = document.createElement("p");
                err.style.cssText = "color:#888; padding:10px;";
                err.textContent = "Unable to load applications.";
                if (bottomBtn) panel.insertBefore(err, bottomBtn);
                else panel.appendChild(err);
                return;
            }

            const apps = data.applications;
            if (apps.length === 0) {
                const empty = document.createElement("p");
                empty.style.cssText = "color:#888; padding:10px;";
                empty.textContent = "You have not submitted any applications yet.";
                if (bottomBtn) panel.insertBefore(empty, bottomBtn);
                else panel.appendChild(empty);
                return;
            }

            apps.forEach(app => {
                const dateStr = app.applied_at
                    ? new Date(app.applied_at).toLocaleDateString("en-US", {month:"long", day:"numeric", year:"numeric"})
                    : "N/A";
                const statusClass = getStatusClass(app.status);

                const statuses = ["Pending", "Under Review", "Shortlisted", "Interview Scheduled", "Selected"];
                let stepIndex = statuses.indexOf(app.status);
                let timelineHTML = "";
                
                if (app.status === "Rejected" || app.status === "Withdrawn") {
                    timelineHTML = `<div style="margin-top:10px; font-size:12px; font-weight:bold; color:#d32f2f;">Status: ${app.status}</div>`;
                } else {
                    if (stepIndex === -1) stepIndex = 0;
                    timelineHTML = `<div style="display:flex; align-items:center; gap:5px; margin-top:10px; font-size:11px; flex-wrap:wrap; color:#666;">`;
                    statuses.forEach((s, i) => {
                        const isPast = i < stepIndex;
                        const isCurrent = i === stepIndex;
                        const color = isCurrent ? "#1565c0" : (isPast ? "#2e7d32" : "#ccc");
                        const fw = isCurrent ? "bold" : "normal";
                        
                        timelineHTML += `<span style="color:${color}; font-weight:${fw};">${s}</span>`;
                        if (i < statuses.length - 1) {
                            timelineHTML += `<span style="color:#eee;">→</span>`;
                        }
                    });
                    timelineHTML += `</div>`;
                }

                const div = document.createElement("div");
                div.className = "application-card";
                div.innerHTML = `
                    <div class="application-info">
                        <h3>${app.course_title || "TA Position"}</h3>
                        <p>Course: ${app.course_code || "N/A"}</p>
                        <p>Applied: ${dateStr}</p>
                        ${timelineHTML}
                        ${app.status === "Interview Scheduled" ? `<p style="color:#1565c0; font-size:13px; margin-top:8px;">📅 Interview has been scheduled. Check with faculty for details.</p>` : ""}
                        ${app.status === "Selected" ? `<p style="color:#2e7d32; font-size:13px; margin-top:8px;">🎉 Congratulations! You have been selected as TA.</p>` : ""}
                    </div>
                    <div class="application-status ${statusClass}">${app.status}</div>
                `;

                if (bottomBtn) {
                    panel.insertBefore(div, bottomBtn);
                } else {
                    panel.appendChild(div);
                }
            });
        })
        .catch(() => {
            loadingEl.textContent = "Error loading applications. Please refresh.";
        });
}

function initAssignedTasks(user) {
    const panel = document.querySelector(".panel");
    if (!panel) return;

    panel.querySelectorAll(".task-card").forEach(c => c.remove());

    const loadingEl = document.createElement("p");
    loadingEl.style.cssText = "color:#888; padding:10px;";
    loadingEl.textContent = "Loading tasks...";
    panel.appendChild(loadingEl);

    fetch(`${API}/applications.php?student_id=${user.id}&status=Selected`)
        .then(r => r.json())
        .then(data => {
            if (data.success && data.applications.length > 0) {
                const app = data.applications[0];
                const taInfoTitle = document.querySelector(".ta-info p");
                if (taInfoTitle) taInfoTitle.textContent = app.course_title || "N/A";
            }
        })
        .catch(() => {});

    fetch(`${API}/tasks.php?student_id=${user.id}`)
        .then(r => r.json())
        .then(data => {
            loadingEl.remove();

            if (!data.success) {
                panel.appendChild(Object.assign(document.createElement("p"), {
                    textContent: "Unable to load tasks.",
                    style: { color:"#888", padding:"10px" }
                }));
                return;
            }

            const tasks = data.tasks;

            const totalEl     = document.querySelectorAll(".stats .stat .number")[0];
            const completedEl = document.querySelectorAll(".stats .stat .number")[1];
            const pendingEl   = document.querySelectorAll(".stats .stat .number")[2];

            const completed = tasks.filter(t => t.status === "Completed").length;
            const pending   = tasks.filter(t => t.status !== "Completed").length;

            if (totalEl)     totalEl.textContent     = String(tasks.length).padStart(2, "0");
            if (completedEl) completedEl.textContent = String(completed).padStart(2, "0");
            if (pendingEl)   pendingEl.textContent   = String(pending).padStart(2, "0");

            if (tasks.length === 0) {
                const empty = document.createElement("p");
                empty.style.cssText = "color:#888; padding:10px;";
                empty.textContent = "No tasks have been assigned yet.";
                panel.appendChild(empty);
                return;
            }

            tasks.forEach((task, index) => {
                const isCompleted = task.status === "Completed";
                const div = document.createElement("div");
                div.className = "task-card";
                div.style.cursor = "pointer";

                div.innerHTML = `
                    <div class="task-number">${String(index + 1).padStart(2, "0")}</div>
                    <div class="task-content">
                        <h3>${task.title}</h3>
                        <p>${task.description || ""}</p>
                        <div class="task-details">
                            <span>Course: ${task.course_code}</span>
                            ${task.task_date  ? `<span>Date: ${task.task_date}</span>`   : ""}
                            ${task.time_slot  ? `<span>Time: ${task.time_slot}</span>`   : ""}
                            ${task.deadline   ? `<span>Deadline: ${task.deadline}</span>` : ""}
                        </div>
                    </div>
                    <div class="task-status ${isCompleted ? "completed" : "pending"}">
                        ${task.status}
                    </div>
                `;

                div.addEventListener("click", function() {
                    const statusEl  = div.querySelector(".task-status");
                    const newStatus = statusEl.classList.contains("completed") ? "Pending" : "Completed";

                    fetch(`${API}/tasks.php?action=toggle`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ task_id: task.id, status: newStatus, action: "toggle" })
                    })
                    .then(r => r.json())
                    .then(res => {
                        if (res.success) {
                            showNotice(`Task marked as ${newStatus}`);
                            statusEl.textContent = newStatus;
                            statusEl.className = `task-status ${newStatus === "Completed" ? "completed" : "pending"}`;
                            task.status = newStatus;

                            const allStatuses = Array.from(panel.querySelectorAll(".task-status")).map(el => el.textContent.trim());
                            const c = allStatuses.filter(s => s === "Completed").length;
                            const p = allStatuses.filter(s => s !== "Completed").length;
                            if (totalEl)     totalEl.textContent     = String(allStatuses.length).padStart(2, "0");
                            if (completedEl) completedEl.textContent = String(c).padStart(2, "0");
                            if (pendingEl)   pendingEl.textContent   = String(p).padStart(2, "0");
                        } else {
                            showNotice("Failed to update task status.", "error");
                        }
                    })
                    .catch(() => showNotice("Network error. Please try again.", "error"));
                });

                panel.appendChild(div);
            });
        })
        .catch(() => {
            loadingEl.textContent = "Error loading tasks. Please refresh.";
        });
}

document.addEventListener("DOMContentLoaded", function() {
    const user = requireStudentLogin();
    if (!user) return;

    updateSidebar(user);

    document.querySelectorAll(".logout a").forEach(el => {
        el.href = "#";
        el.addEventListener("click", function(e) {
            e.preventDefault();
            logout();
        });
    });

    const path = window.location.pathname;

    if (path.includes("student_dashboard.html")) {
        initDashboard(user);
    } else if (path.includes("student_profile.html")) {
        initProfile(user);
    } else if (path.includes("ta_position.html")) {
        initPositions(user);
    } else if (path.includes("apply.html")) {
        initApply(user);
    } else if (path.includes("my_applications.html")) {
        initMyApplications(user);
    } else if (path.includes("assigned_task.html")) {
        initAssignedTasks(user);
    } else if (path.includes("appointment_letter.html")) {
        initAppointmentLetter(user);
    }
});

function initAppointmentLetter(user) {
    const container = document.getElementById("letter-content");
    if (!container) return;

    container.innerHTML = `<p style="color:#888; padding:20px 0;">Loading your appointment letter...</p>`;

    fetch(`${API}/letters.php?student_uni_id=${encodeURIComponent(user.university_id || user.username)}`)
        .then(r => r.json())
        .then(data => {
            if (!data.success || data.letters.length === 0) {
                container.innerHTML = `
                    <div class="no-letter-msg">
                        <div class="icon">📜</div>
                        <strong>No appointment letter issued yet.</strong>
                        <p style="margin-top:8px; font-size:13px;">
                            Once you are selected as a TA and the Hiring Coordinator issues your letter, it will appear here.
                        </p>
                    </div>`;
                return;
            }

            const letter = data.letters[0];
            const issued = new Date(letter.issued_at).toLocaleDateString("en-US", {day:"numeric", month:"long", year:"numeric"});
            const startFmt = letter.start_date ? new Date(letter.start_date).toLocaleDateString("en-US", {day:"numeric", month:"long", year:"numeric"}) : "—";
            const endFmt   = letter.end_date   ? new Date(letter.end_date).toLocaleDateString("en-US",   {day:"numeric", month:"long", year:"numeric"}) : "—";

            const firstName = user.name ? user.name.split(" ")[0] : "Student";
            const gender    = "";
            const salutation= `Dear ${firstName},`;

            container.innerHTML = `
                <div class="letter-meta">
                    Ref: <strong>${letter.ref_no}</strong>
                    <span class="status-badge">✓ ${letter.status}</span>
                </div>
                <div class="letter-sheet">
                    <div class="letter-header">
                        <div>
                            <div class="uni-name">United International University</div>
                            <div class="uni-dept">Department of Computer Science &amp; Engineering</div>
                        </div>
                        <div class="seal">UIU</div>
                    </div>

                    <div class="ref-line">Ref: ${letter.ref_no} &nbsp;·&nbsp; Date: ${issued}</div>

                    <p><strong>${user.name}</strong><br>Student ID: ${user.university_id}<br>${user.email || ""}</p>

                    <p>${salutation}</p>

                    <p>
                        I am pleased to offer you the position of <strong>${letter.course_title}</strong>
                        for the current term. This letter confirms the terms of your appointment.
                    </p>

                    <p>
                        You will work <strong>${letter.weekly_hours} hours per week</strong>,
                        beginning <strong>${startFmt}</strong> and
                        concluding <strong>${endFmt}</strong>,
                        at a monthly stipend of <strong>BDT ${parseFloat(letter.stipend).toLocaleString()}</strong>,
                        disbursed at the end of each month. Your duties will include supporting laboratory sessions,
                        holding office hours, and grading assignments, under the supervision of
                        <strong>${letter.reports_to}</strong>.
                    </p>

                    <p>
                        Please confirm your acceptance by signing and returning a copy of this letter to the department office.
                        We look forward to working with you this term.
                    </p>

                    <div class="sig-block">
                        <div class="sig-line"></div>
                        <p style="margin:0;">${letter.reports_to}<br>Hiring Coordinator, Department of Computer Science &amp; Engineering</p>
                    </div>
                </div>
                <div class="bottom-button no-print" style="margin-top:16px;">
                    <button onclick="window.print()" style="background:#17437a; color:#fff; border:none; padding:10px 24px; border-radius:8px; font-size:14px; cursor:pointer;">
                        🖨️ Print Letter
                    </button>
                </div>
            `;
        })
        .catch(() => {
            container.innerHTML = `<p style="color:#c00; padding:20px 0;">Error loading letter. Please refresh the page.</p>`;
        });
}
