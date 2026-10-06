// ========================================================
// naimur/faculty.js — Faculty Portal JavaScript
// UIU TA Management System
// ========================================================

// ─── 1. API BASE URL ────────────────────────────────────
const API = "../api";

// ─── 2. GET LOGGED-IN USER ───────────────────────────────────────
function getUser() {
    try {
        return JSON.parse(localStorage.getItem("uiu_user")) || null;
    } catch (e) {
        return null;
    }
}

// ─── 3. REQUIRE FACULTY OR ADMIN LOGIN ───────────────────────────
function requireFacultyLogin() {
    const user = getUser();
    if (!user) {
        window.location.href = "../kazol/login.html";
        return null;
    }
    if (user.role !== "faculty" && user.role !== "admin") {
        alert("Access denied. This page is for faculty/admin only.");
        window.location.href = "../kazol/login.html";
        return null;
    }
    
    fetch(`${API}/auth.php`)
        .then(r => r.json())
        .then(data => {
            if (!data.success || (data.user.role !== "faculty" && data.user.role !== "admin")) {
                localStorage.removeItem("uiu_user");
                window.location.href = "../kazol/login.html";
            }
        }).catch(() => {});
        
    return user;
}

// ─── 4. SHOW INLINE NOTIFICATION ─────────────────────────────────
function showNotice(message, type = "success") {
    let notice = document.getElementById("js-notice");
    if (!notice) {
        notice = document.createElement("div");
        notice.id = "js-notice";
        notice.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 9999;
            padding: 12px 20px; border-radius: 8px; font-size: 14px;
            font-weight: 600; color: #fff; max-width: 350px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: opacity 0.4s;
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

// ─── 5. LOGOUT ────────────────────────────────────────────────────
function logout() {
    localStorage.removeItem("uiu_user");
    fetch(`${API}/auth.php?action=logout`).finally(() => {
        window.location.href = "../kazol/login.html";
    });
}

// ─── 6. STATUS BADGE CSS CLASS ───────────────────────────────────
function getBadgeClass(status) {
    const map = {
        "Pending":             "badge-pending",
        "Reviewed":            "badge-pending",
        "Shortlisted":         "badge-shortlisted",
        "Interview Scheduled": "badge-interview",
        "Selected":            "badge-completed",
        "Rejected":            "badge-rejected"
    };
    return map[status] || "badge-pending";
}

// ─── 7. SEARCH FILTER for tables ─────────────────────────────────
function initTableSearch(inputSelector) {
    const input = document.querySelector(inputSelector);
    if (!input) return;
    input.addEventListener("input", function() {
        const filter = this.value.toLowerCase();
        document.querySelectorAll("table tbody tr").forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
        });
    });
}


// ─────────────────────────────────────────────────────────────────
// PAGE: FACULTY DASHBOARD
// ─────────────────────────────────────────────────────────────────
function initDashboard(user) {
    // Update faculty name in header
    const nameEl = document.querySelector(".dashboard-style-5");
    if (nameEl) nameEl.textContent = user.name || "Faculty";

    // Load real stats
    fetch(`${API}/stats.php`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            const s = data.stats;

            const statH2s = document.querySelectorAll(".stat-box h2");
            if (statH2s[0]) statH2s[0].textContent = String(s.total_applicants).padStart(2, "0");
            if (statH2s[1]) statH2s[1].textContent = String(s.shortlisted).padStart(2, "0");
            if (statH2s[2]) statH2s[2].textContent = String(s.scheduled_interviews).padStart(2, "0");
            if (statH2s[3]) statH2s[3].textContent = String(s.assigned_tas).padStart(2, "0");
        })
        .catch(() => {});

    // Load recent applicants table
    fetch(`${API}/applications.php`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;

            const tbody = document.querySelector("table tbody");
            if (!tbody) return;
            tbody.innerHTML = "";

            const recent = data.applications.slice(0, 5);
            if (recent.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888; padding:20px;">No applicants yet.</td></tr>`;
                return;
            }

            recent.forEach(app => {
                const initials = app.student_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                const badgeClass = getBadgeClass(app.status);
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>
                        <div class="student-info">
                            <div class="student-initials">${initials}</div>
                            <div>
                                <div class="student-name">${app.student_name}</div>
                            </div>
                        </div>
                    </td>
                    <td class="dashboard-style-19">${parseFloat(app.cgpa).toFixed(2)}</td>
                    <td><span class="badge ${badgeClass}">${app.status}</span></td>
                    <td>
                        <button class="action-link" style="background:none;border:none;cursor:pointer;color:#17437a;font-weight:600;"
                            data-id="${app.id}" data-status="${app.status}">
                            Review
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Review button → go to applicants page
            tbody.querySelectorAll("button[data-id]").forEach(btn => {
                btn.addEventListener("click", () => {
                    window.location.href = "applicants.html";
                });
            });
        })
        .catch(() => {});
}


// ─────────────────────────────────────────────────────────────────
// PAGE: APPLICANTS (applicants.html)
// ─────────────────────────────────────────────────────────────────
function initApplicants(user) {
    initTableSearch(".applicants-style-22");

    // Contact Coordinator Button
    const contactBtn = document.querySelector(".applicants-style-21");
    if (contactBtn) {
        contactBtn.addEventListener("click", () => {
            alert("Opening communication panel with Hiring Coordinator (Dr. Ayesha Karim)...");
            window.location.href = "mailto:ayesha.karim@uiu.ac.bd?subject=TA%20Hiring%20Inquiry";
        });
    }

    const tbody = document.querySelector("table tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888; padding:20px;">Loading applicants...</td></tr>`;

    fetch(`${API}/applications.php`)
        .then(r => r.json())
        .then(data => {
            tbody.innerHTML = "";

            if (!data.success || data.applications.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888; padding:20px;">No applicants found.</td></tr>`;
                return;
            }

            data.applications.forEach(app => {
                const initials = app.student_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "ST";
                const badgeClass = getBadgeClass(app.status);

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>
                        <div class="student-info">
                            <div class="student-initials">${initials}</div>
                            <div><div class="student-name">${app.student_name}</div></div>
                        </div>
                    </td>
                    <td class="applicants-style-2">${app.student_uni_id}</td>
                    <td class="applicants-style-23">${parseFloat(app.cgpa).toFixed(2)}</td>
                    <td><span class="badge ${badgeClass}">${app.status}</span></td>
                    <td>
                        <select class="status-select" data-id="${app.id}" style="border:1px solid #ccc; border-radius:6px; padding:4px 8px; font-size:12px; cursor:pointer;">
                            <option value="">Change Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview Scheduled">Interview Scheduled</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Status change handler
            tbody.querySelectorAll(".status-select").forEach(sel => {
                sel.addEventListener("change", function() {
                    const appId = this.getAttribute("data-id");
                    const newStatus = this.value;
                    if (!newStatus) return;

                    fetch(`${API}/applications.php?action=status`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ application_id: appId, status: newStatus, action: "status" })
                    })
                    .then(r => r.json())
                    .then(res => {
                        if (res.success) {
                            showNotice(`Status updated to: ${newStatus}`);
                            const row = this.closest("tr");
                            const badge = row.querySelector(".badge");
                            if (badge) {
                                badge.textContent = newStatus;
                                badge.className = `badge ${getBadgeClass(newStatus)}`;
                            }
                            this.value = "";
                        } else {
                            showNotice(res.message || "Failed to update status", "error");
                        }
                    })
                    .catch(() => showNotice("Network error", "error"));
                });
            });
        })
        .catch(() => {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#c00; padding:20px;">Error loading data. Please refresh.</td></tr>`;
        });

    // Bottom: Shortlist Selected button
    const shortlistBtn = document.querySelector(".applicants-style-25");
    if (shortlistBtn) {
        shortlistBtn.addEventListener("click", () => {
            window.location.href = "shortlist.html";
        });
    }
    // Bottom: Schedule Interview button
    const scheduleBtn = document.querySelector(".applicants-style-26");
    if (scheduleBtn) {
        scheduleBtn.addEventListener("click", () => {
            window.location.href = "interviews.html";
        });
    }
}


// ─────────────────────────────────────────────────────────────────
// PAGE: SHORTLISTED STUDENTS (shortlist.html)
// ─────────────────────────────────────────────────────────────────
function initShortlist(user) {
    const tbody = document.querySelector(".table-container table tbody");
    if (!tbody) return;

    // Load pending applications (eligible to shortlist)
    fetch(`${API}/applications.php`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;

            tbody.innerHTML = "";
            const pending = data.applications.filter(a =>
                a.status === "Pending" || a.status === "Reviewed"
            );

            if (pending.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888; padding:20px;">No pending applicants to shortlist.</td></tr>`;
            } else {
                pending.forEach(app => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>
                            <div class="student-name">${app.student_name}</div>
                            <div class="student-id">${app.student_uni_id}</div>
                            <div style="font-size:12px; color:#555; margin-top:2px;">${app.course_title}</div>
                        </td>
                        <td class="shortlist-style-32">${parseFloat(app.cgpa).toFixed(2)}</td>
                        <td><span class="badge shortlist-style-33">Eligible</span></td>
                        <td>
                            <button class="btn btn-primary shortlist-btn" data-id="${app.id}" data-name="${app.student_name}"
                                style="font-size:12px; padding:6px 14px;">
                                + Shortlist
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            // Reload left panel shortlisted list
            loadShortlistedPanel();

            // Wire shortlist buttons
            tbody.querySelectorAll(".shortlist-btn").forEach(btn => {
                btn.addEventListener("click", function() {
                    const appId = this.getAttribute("data-id");
                    const name  = this.getAttribute("data-name");

                    this.disabled    = true;
                    this.textContent = "Shortlisting...";

                    fetch(`${API}/applications.php?action=status`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ application_id: appId, status: "Shortlisted", action: "status" })
                    })
                    .then(r => r.json())
                    .then(res => {
                        if (res.success) {
                            showNotice(`${name} has been shortlisted!`);
                            // Remove from pending list
                            this.closest("tr").remove();
                            // Reload shortlisted panel
                            loadShortlistedPanel();
                        } else {
                            showNotice("Failed to shortlist", "error");
                            this.disabled    = false;
                            this.textContent = "+ Shortlist";
                        }
                    })
                    .catch(() => {
                        showNotice("Network error", "error");
                        this.disabled    = false;
                        this.textContent = "+ Shortlist";
                    });
                });
            });
            
            // Bottom Action Buttons
            const scheduleBtn = document.querySelector(".shortlist-style-40");
            if (scheduleBtn) {
                scheduleBtn.addEventListener("click", () => {
                    window.location.href = "interviews.html";
                });
            }

            const saveBtn = document.querySelector(".shortlist-style-39 .btn-primary:last-child");
            if (saveBtn) {
                saveBtn.addEventListener("click", () => {
                    saveBtn.disabled = true;
                    saveBtn.textContent = "Saving...";
                    setTimeout(() => {
                        showNotice("Shortlist finalized and saved successfully!");
                        saveBtn.disabled = false;
                        saveBtn.textContent = "Save Shortlist";
                    }, 800);
                });
            }

        })
        .catch(() => {});
}

function loadShortlistedPanel() {
    const panel = document.getElementById("shortlist-panel-container");
    const countLabel = document.getElementById("shortlist-count");
    if (!panel) return;

    fetch(`${API}/applications.php?status=Shortlisted`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            const apps = data.applications;

            if (countLabel) countLabel.textContent = `${apps.length} Students`;
            panel.innerHTML = "";

            if (apps.length === 0) {
                panel.innerHTML = `<p style="padding:10px; color:#888; text-align:center;">No students shortlisted yet.</p>`;
                return;
            }

            apps.forEach(app => {
                const initials = app.student_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                const entry = document.createElement("div");
                entry.className = "shortlist-style-23";
                entry.innerHTML = `
                    <div class="student-info shortlist-style-24">
                        <div class="student-initials shortlist-style-25">${initials}</div>
                        <div><div class="student-name shortlist-style-26">${app.student_name}</div></div>
                    </div>
                    <span class="shortlist-style-27">✓</span>
                `;
                panel.appendChild(entry);
            });
        })
        .catch(() => {});
}


// ─────────────────────────────────────────────────────────────────
// PAGE: INTERVIEWS (interviews.html)
// ─────────────────────────────────────────────────────────────────
function initInterviews(user) {
    initTableSearch(".interviews-style-23");

    // Fill faculty card with real user data
    const nameEl = document.getElementById("iv-faculty-name");
    if (nameEl) nameEl.textContent = user.name || "Faculty";
    const avatarEl = document.getElementById("iv-faculty-avatar");
    if (avatarEl) avatarEl.textContent = (user.name || "F").charAt(0).toUpperCase();

    // Load interviews table
    loadInterviewsTable();

    // Schedule new interview button
    const scheduleBtn = document.querySelector(".interviews-style-4");
    if (scheduleBtn) {
        scheduleBtn.addEventListener("click", showScheduleInterviewForm);
    }
}

function loadInterviewsTable() {
    const tbody = document.querySelector("table tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888; padding:20px;">Loading interviews...</td></tr>`;

    fetch(`${API}/interviews.php`)
        .then(r => r.json())
        .then(data => {
            tbody.innerHTML = "";

            if (!data.success || data.interviews.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888; padding:20px;">No interviews scheduled. Click "+ Schedule New Interview" above.</td></tr>`;
                // Update progress
                const progEl = document.getElementById("iv-progress");
                if (progEl) progEl.textContent = "0";
                const countEl = document.getElementById("iv-total-count");
                if (countEl) countEl.textContent = "0 Scheduled";
                return;
            }

            const total    = data.interviews.length;
            const completed= data.interviews.filter(iv => iv.status === "Completed").length;

            // Update progress stats
            const progEl = document.getElementById("iv-progress");
            if (progEl) progEl.textContent = `${completed}/${total}`;
            const countEl = document.getElementById("iv-total-count");
            if (countEl) countEl.textContent = `${total} Scheduled`;
            const barFill = document.getElementById("iv-bar-fill");
            if (barFill) barFill.style.width = total > 0 ? `${Math.round((completed/total)*100)}%` : "0%";

            data.interviews.forEach(iv => {
                const initials = iv.student_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                const dateStr  = iv.interview_date
                    ? new Date(iv.interview_date).toLocaleDateString("en-US", {day:"numeric", month:"long", year:"numeric"})
                    : "N/A";
                const statusColor = iv.status === "Completed" ? "#2e7d32" : (iv.status === "Cancelled" ? "#c62828" : "#1565c0");

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>
                        <div class="student-info">
                            <div class="student-initials">${initials}</div>
                            <div>
                                <div class="student-name">${iv.student_name}</div>
                                <div class="student-id">ID: ${iv.student_uni_id}</div>
                            </div>
                        </div>
                    </td>
                    <td>${iv.course_title}</td>
                    <td>
                        <div class="interviews-style-14">${dateStr}</div>
                        <div class="interviews-style-24">🕒 ${iv.interview_time}</div>
                    </td>
                    <td>📍 ${iv.location}</td>
                    <td><span style="color:${statusColor};">● ${iv.status}</span></td>
                    <td style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                        <select class="iv-status-select" data-id="${iv.id}"
                            style="border:1px solid #ccc; border-radius:6px; padding:4px 8px; font-size:12px; cursor:pointer;">
                            <option value="">Update</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        ${iv.application_id ? `<button class="accept-btn btn btn-primary" data-app-id="${iv.application_id}" data-name="${iv.student_name}"
                            style="font-size:11px; padding:4px 10px; background:#2e7d32;">✓ Accept</button>` : ""}
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Wire status selects
            tbody.querySelectorAll(".iv-status-select").forEach(sel => {
                sel.addEventListener("change", function() {
                    const ivId   = this.getAttribute("data-id");
                    const status = this.value;
                    if (!status) return;

                    fetch(`${API}/interviews.php?action=status`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ interview_id: ivId, status: status, action: "status" })
                    })
                    .then(r => r.json())
                    .then(res => {
                        if (res.success) {
                            showNotice(`Interview marked as ${status}`);
                            loadInterviewsTable();
                        } else {
                            showNotice("Failed to update", "error");
                        }
                    })
                    .catch(() => showNotice("Network error", "error"));
                });
            });

            // Wire Accept buttons — marks application as Selected
            tbody.querySelectorAll(".accept-btn").forEach(btn => {
                btn.addEventListener("click", function() {
                    const appId = this.getAttribute("data-app-id");
                    const name  = this.getAttribute("data-name");
                    if (!confirm(`Accept ${name} as a TA? This will mark their application as Selected.`)) return;

                    this.disabled    = true;
                    this.textContent = "Accepting...";
                    const btnRef = this;

                    fetch(`${API}/applications.php?action=status`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ application_id: appId, status: "Selected", action: "status" })
                    })
                    .then(r => r.json())
                    .then(res => {
                        if (res.success) {
                            showNotice(`${name} has been accepted as TA! ✓`);
                            btnRef.textContent = "✓ Accepted";
                            btnRef.style.background = "#555";
                        } else {
                            showNotice(res.message || "Failed to accept", "error");
                            btnRef.disabled    = false;
                            btnRef.textContent = "✓ Accept";
                        }
                    })
                    .catch(() => {
                        showNotice("Network error", "error");
                        btnRef.disabled    = false;
                        btnRef.textContent = "✓ Accept";
                    });
                });
            });
        })
        .catch(() => {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#c00; padding:20px;">Error loading data. Please refresh.</td></tr>`;
        });
}

function showScheduleInterviewForm() {
    // Simple form modal using a div overlay
    const overlay = document.createElement("div");
    overlay.id = "iv-overlay";
    overlay.style.cssText = `
        position:fixed; top:0; left:0; right:0; bottom:0;
        background:rgba(0,0,0,0.5); z-index:10000; display:flex;
        align-items:center; justify-content:center;
    `;

    // Load shortlisted/interview-scheduled applicants for selection
    fetch(`${API}/applications.php`)
        .then(r => r.json())
        .then(data => {
            let applicantOptions = "";
            if (data.success) {
                data.applications
                    .filter(a => a.status === "Shortlisted" || a.status === "Pending" || a.status === "Reviewed")
                    .forEach(a => {
                        applicantOptions += `<option value="${a.id}" data-name="${a.student_name}" data-uid="${a.student_uni_id}" data-course="${a.course_title}">${a.student_name} — ${a.course_title}</option>`;
                    });
            }

            overlay.innerHTML = `
                <div style="background:#fff; border-radius:12px; padding:30px; width:480px; max-width:95vw; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                    <h3 style="margin:0 0 20px; color:#17437a;">📅 Schedule Interview</h3>
                    <div style="margin-bottom:14px;">
                        <label style="font-size:13px; font-weight:600; display:block; margin-bottom:4px;">Applicant</label>
                        <select id="iv-applicant" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:13px;">
                            <option value="">Select applicant</option>
                            ${applicantOptions}
                        </select>
                    </div>
                    <div style="margin-bottom:14px;">
                        <label style="font-size:13px; font-weight:600; display:block; margin-bottom:4px;">Interview Date</label>
                        <input type="date" id="iv-date" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:13px; box-sizing:border-box;">
                    </div>
                    <div style="margin-bottom:14px;">
                        <label style="font-size:13px; font-weight:600; display:block; margin-bottom:4px;">Time</label>
                        <input type="time" id="iv-time" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:13px; box-sizing:border-box;">
                    </div>
                    <div style="margin-bottom:20px;">
                        <label style="font-size:13px; font-weight:600; display:block; margin-bottom:4px;">Location</label>
                        <input type="text" id="iv-location" value="Room 836 (A)" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:13px; box-sizing:border-box;">
                    </div>
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button id="iv-cancel" class="btn btn-outline" style="padding:10px 20px;">Cancel</button>
                        <button id="iv-submit" class="btn btn-primary" style="padding:10px 20px;">Schedule</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            document.getElementById("iv-cancel").addEventListener("click", () => overlay.remove());
            overlay.addEventListener("click", function(e) { if (e.target === overlay) overlay.remove(); });

            document.getElementById("iv-submit").addEventListener("click", function() {
                const applicantSel = document.getElementById("iv-applicant");
                const selectedOpt  = applicantSel.options[applicantSel.selectedIndex];
                const appId       = applicantSel.value;
                const studentName = selectedOpt.getAttribute("data-name") || "";
                const studentUid  = selectedOpt.getAttribute("data-uid")  || "";
                const courseTitle = selectedOpt.getAttribute("data-course") || "Web Programming";
                const date        = document.getElementById("iv-date").value;
                const time        = document.getElementById("iv-time").value;
                const location    = document.getElementById("iv-location").value;

                if (!appId || !date || !time) {
                    showNotice("Please fill all required fields.", "error");
                    return;
                }

                // Format time to readable string
                const [h, m]   = time.split(":");
                const hour     = parseInt(h);
                const ampm     = hour >= 12 ? "PM" : "AM";
                const hour12   = hour % 12 || 12;
                const timeStr  = `${hour12}:${m} ${ampm}`;

                const btn = this;
                btn.disabled = true;
                btn.textContent = "Scheduling...";

                fetch(`${API}/interviews.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        application_id:  appId,
                        student_name:    studentName,
                        student_uni_id:  studentUid,
                        course_title:    courseTitle,
                        faculty_name:    getUser()?.name || "Faculty",
                        interview_date:  date,
                        interview_time:  timeStr,
                        location:        location
                    })
                })
                .then(r => r.json())
                .then(res => {
                    if (res.success) {
                        showNotice("Interview scheduled successfully!");
                        overlay.remove();
                        loadInterviewsTable();
                    } else {
                        showNotice(res.message || "Failed to schedule interview", "error");
                        btn.disabled    = false;
                        btn.textContent = "Schedule";
                    }
                })
                .catch(() => {
                    showNotice("Network error. Please try again.", "error");
                    btn.disabled    = false;
                    btn.textContent = "Schedule";
                });
            });
        })
        .catch(() => {
            document.body.appendChild(overlay);
            overlay.innerHTML = `<div style="background:#fff; padding:30px; border-radius:12px;">Error loading applicants. Please refresh.</div>`;
        });
}


// ─────────────────────────────────────────────────────────────────
// PAGE: TA REVIEWS (reviews.html)
// ─────────────────────────────────────────────────────────────────
function initReviews(user) {
    // Load existing reviews into left table
    loadReviewsTable();

    // Stars interaction
    let selectedRating = 5;
    const stars = document.querySelectorAll(".rating-stars span");
    stars.forEach((star, index) => {
        star.style.cursor = "pointer";
        star.addEventListener("click", function() {
            selectedRating = index + 1;
            stars.forEach((s, i) => {
                s.style.color = i < selectedRating ? "#ff9800" : "#ddd";
            });
        });
        star.addEventListener("mouseenter", function() {
            stars.forEach((s, i) => {
                s.style.color = i <= index ? "#ff9800" : "#ddd";
            });
        });
    });

    // Wire review submit button
    const submitBtn = document.querySelector("#formContent .btn-primary");
    if (submitBtn) {
        submitBtn.onclick = null; // Remove inline onclick
        submitBtn.addEventListener("click", function() {
            const taName    = document.getElementById("taName")?.innerText || "";
            const course    = document.getElementById("taCourse")?.innerText || "Web Programming";
            const uid       = document.getElementById("taUid")?.innerText   || "";
            const punctSel  = document.querySelector("select:nth-of-type(1)")?.value || "Excellent - Always on time";
            const knowSel   = document.querySelector("select:nth-of-type(2)")?.value || "Excellent - Strong grasp of concepts";
            const feedback  = document.querySelector("textarea.form-control")?.value.trim() || "";

            if (!taName) {
                showNotice("Please select a TA to review.", "error");
                return;
            }

            this.disabled    = true;
            this.textContent = "Submitting...";

            fetch(`${API}/reviews.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_name:    taName,
                    student_uni_id:  uid,
                    course_title:    course,
                    faculty_name:    user.name || "Faculty",
                    rating:          selectedRating,
                    punctuality:     punctSel,
                    knowledge:       knowSel,
                    feedback:        feedback
                })
            })
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    showNotice("Review submitted successfully!");
                    // Mark as reviewed in table
                    document.querySelectorAll("table tbody tr").forEach(row => {
                        if (row.innerText.includes(taName)) {
                            const badge = row.querySelector(".badge");
                            if (badge) { badge.className = "badge badge-completed"; badge.textContent = "Reviewed"; }
                            const btn = row.querySelector("button.btn-outline");
                            if (btn) btn.textContent = "View Review";
                        }
                    });
                    loadReviewsTable();
                } else {
                    showNotice(res.message || "Failed to submit review", "error");
                }
                this.disabled    = false;
                this.textContent = "Submit Review";
            })
            .catch(() => {
                showNotice("Network error", "error");
                this.disabled    = false;
                this.textContent = "Submit Review";
            });
        });
    }
}

function loadReviewsTable() {
    // Reviews page uses static TA list from assigned tasks — we can load from DB
    const tbody = document.querySelector("table tbody");
    if (!tbody) return;

    // Load assigned TAs (Selected applications) to show in review list
    fetch(`${API}/applications.php?status=Selected`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            tbody.innerHTML = "";

            if (data.applications.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888; padding:20px;">No assigned TAs yet.</td></tr>`;
                return;
            }

            data.applications.forEach(app => {
                const initials = app.student_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>
                        <div class="student-info">
                            <div class="student-initials">${initials}</div>
                            <div>
                                <div class="student-name">${app.student_name}</div>
                                <div class="student-id">${app.student_uni_id}</div>
                            </div>
                        </div>
                    </td>
                    <td style="font-size:13px;">${app.course_title}</td>
                    <td><span class="badge badge-pending">Pending</span></td>
                    <td>
                        <button class="btn btn-outline" style="border-color:#17437a; color:#17437a;"
                            data-name="${app.student_name}" data-uid="${app.student_uni_id}" data-course="${app.course_title}">
                            Write Review
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Check which already have reviews and update badge
            fetch(`${API}/reviews.php`)
                .then(r => r.json())
                .then(rdata => {
                    if (!rdata.success) return;
                    const reviewedNames = rdata.reviews.map(r => r.student_name);
                    tbody.querySelectorAll("tr").forEach(row => {
                        const nameEl = row.querySelector(".student-name");
                        if (nameEl && reviewedNames.includes(nameEl.textContent)) {
                            const badge = row.querySelector(".badge");
                            if (badge) { badge.className = "badge badge-completed"; badge.textContent = "Reviewed"; }
                            const btn = row.querySelector("button");
                            if (btn) btn.textContent = "View Review";
                        }
                    });
                }).catch(() => {});

            // Wire "Write Review" buttons
            tbody.querySelectorAll("button[data-name]").forEach(btn => {
                btn.addEventListener("click", function() {
                    // Show review form
                    document.getElementById("emptyState").style.display = "none";
                    document.getElementById("formContent").style.display = "block";
                    document.getElementById("taName").innerText = this.getAttribute("data-name");

                    // Store uid and course for submission
                    let uidEl = document.getElementById("taUid");
                    if (!uidEl) {
                        uidEl = document.createElement("span");
                        uidEl.id = "taUid";
                        uidEl.style.display = "none";
                        document.getElementById("formContent").appendChild(uidEl);
                    }
                    uidEl.innerText = this.getAttribute("data-uid");

                    let courseEl = document.getElementById("taCourse");
                    if (!courseEl) {
                        courseEl = document.createElement("span");
                        courseEl.id = "taCourse";
                        courseEl.style.display = "none";
                        document.getElementById("formContent").appendChild(courseEl);
                    }
                    courseEl.innerText = this.getAttribute("data-course");
                });
            });
        })
        .catch(() => {});
}


// ─────────────────────────────────────────────────────────────────
// PAGE: ASSIGNED TAs (assigned.html)
// ─────────────────────────────────────────────────────────────────
function initAssigned(user) {
    const tbody = document.querySelector(".table-container table tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888; padding:20px;">Loading assigned TAs...</td></tr>`;

    // Load Selected applications
    fetch(`${API}/applications.php?status=Selected`)
        .then(r => r.json())
        .then(data => {
            tbody.innerHTML = "";

            if (!data.success || data.applications.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888; padding:20px;">No assigned TAs yet.</td></tr>`;

                // Update stat boxes
                const statDivs = document.querySelectorAll(".assigned-style-17, .assigned-style-19, .assigned-style-21");
                if (statDivs[0]) statDivs[0].textContent = "0";
                if (statDivs[1]) statDivs[1].textContent = "0";
                return;
            }

            // Update stat boxes
            const totalApps = data.applications.length;
            const allAppsStmt = fetch(`${API}/applications.php`)
                .then(r => r.json())
                .then(allData => {
                    const totEl = document.querySelector(".assigned-style-17");
                    const selEl = document.querySelector(".assigned-style-19");
                    if (totEl) totEl.textContent = allData.success ? allData.applications.length : "?";
                    if (selEl) selEl.textContent = totalApps;
                }).catch(() => {});

            const sectionLabels = ["Section A", "Section B", "Section C", "Section D"];
            data.applications.forEach((app, i) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>
                        <div class="student-name assigned-style-29">${app.student_name}</div>
                        <div class="student-id">ID: ${app.student_uni_id}</div>
                    </td>
                    <td class="assigned-style-14">${parseFloat(app.cgpa).toFixed(2)}</td>
                    <td><span class="assigned-style-25">●</span> ${sectionLabels[i % sectionLabels.length]}</td>
                    <td><span class="badge assigned-style-30">● Appointment Letter Sent</span></td>
                    <td>
                        <button class="action-link assign-task-btn" data-id="${app.student_id}" data-name="${app.student_name}" data-course="${app.course_code}"
                            style="background:none; border:none; cursor:pointer; color:#17437a; font-weight:600; font-size:13px;">
                            Assign Task
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Wire "Assign Task" buttons
            tbody.querySelectorAll(".assign-task-btn").forEach(btn => {
                btn.addEventListener("click", function() {
                    const studentId  = this.getAttribute("data-id");
                    const studentName = this.getAttribute("data-name");
                    const courseCode  = this.getAttribute("data-course");
                    showAssignTaskForm(studentId, studentName, courseCode);
                });
            });
        })
        .catch(() => {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#c00; padding:20px;">Error loading data.</td></tr>`;
        });

    // Generate Appointment Letter button
    const generateBtn = document.querySelector(".btn-primary:not(.shortlist-btn)");
    if (generateBtn && generateBtn.textContent.includes("Generate")) {
        generateBtn.addEventListener("click", () => {
            window.location.href = "../bappy/appointment-letter.html";
        });
    }

    const viewApplicantsBtn = document.querySelector(".assigned-style-32");
    if (viewApplicantsBtn) {
        viewApplicantsBtn.addEventListener("click", () => {
            window.location.href = "applicants.html";
        });
    }
}

function showAssignTaskForm(studentId, studentName, courseCode) {
    // Remove existing overlay
    document.getElementById("task-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "task-overlay";
    overlay.style.cssText = `
        position:fixed; top:0; left:0; right:0; bottom:0;
        background:rgba(0,0,0,0.5); z-index:10000; display:flex;
        align-items:center; justify-content:center;
    `;
    overlay.innerHTML = `
        <div style="background:#fff; border-radius:12px; padding:30px; width:460px; max-width:95vw; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
            <h3 style="margin:0 0 20px; color:#17437a;">📋 Assign Task to ${studentName}</h3>
            <div style="margin-bottom:12px;">
                <label style="font-size:13px; font-weight:600; display:block; margin-bottom:4px;">Task Title *</label>
                <input type="text" id="task-title" placeholder="e.g. Conduct Lab Session"
                    style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:13px; box-sizing:border-box;">
            </div>
            <div style="margin-bottom:12px;">
                <label style="font-size:13px; font-weight:600; display:block; margin-bottom:4px;">Description</label>
                <textarea id="task-desc" rows="3" placeholder="Task details..."
                    style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:13px; box-sizing:border-box; resize:vertical;"></textarea>
            </div>
            <div style="margin-bottom:12px;">
                <label style="font-size:13px; font-weight:600; display:block; margin-bottom:4px;">Deadline</label>
                <input type="date" id="task-deadline"
                    style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:13px; box-sizing:border-box;">
            </div>
            <div style="display:flex; gap:10px; justify-content:flex-end;">
                <button id="task-cancel" class="btn btn-outline" style="padding:10px 20px;">Cancel</button>
                <button id="task-submit" class="btn btn-primary" style="padding:10px 20px;">Assign Task</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById("task-cancel").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });

    document.getElementById("task-submit").addEventListener("click", function() {
        const title    = document.getElementById("task-title").value.trim();
        const desc     = document.getElementById("task-desc").value.trim();
        const deadline = document.getElementById("task-deadline").value;

        if (!title) {
            showNotice("Task title is required.", "error");
            return;
        }

        const deadlineStr = deadline
            ? new Date(deadline).toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"})
            : "";

        this.disabled    = true;
        this.textContent = "Assigning...";

        fetch(`${API}/tasks.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                student_id:  studentId,
                course_code: courseCode || "N/A",
                title:       title,
                description: desc,
                deadline:    deadlineStr
            })
        })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                showNotice(`Task "${title}" assigned to ${studentName}!`);
                overlay.remove();
            } else {
                showNotice(res.message || "Failed to assign task.", "error");
                this.disabled    = false;
                this.textContent = "Assign Task";
            }
        })
        .catch(() => {
            showNotice("Network error.", "error");
            this.disabled    = false;
            this.textContent = "Assign Task";
        });
    });
}


// ─────────────────────────────────────────────────────────────────
// MAIN — Initialize based on current page
// ─────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function() {
    const user = requireFacultyLogin();
    if (!user) return;

    // Wire logout
    document.querySelectorAll(".logout-btn").forEach(el => {
        el.href = "#";
        el.addEventListener("click", function(e) {
            e.preventDefault();
            logout();
        });
    });

    const path = window.location.pathname;

    if (path.includes("dashboard.html")) {
        initDashboard(user);
    } else if (path.includes("applicants.html")) {
        initApplicants(user);
    } else if (path.includes("shortlist.html")) {
        initShortlist(user);
    } else if (path.includes("interviews.html")) {
        initInterviews(user);
    } else if (path.includes("reviews.html")) {
        initReviews(user);
    } else if (path.includes("assigned.html")) {
        initAssigned(user);
    }
});
