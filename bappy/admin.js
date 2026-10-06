// ========================================================
// bappy/admin.js — Admin/Hiring Coordinator JavaScript
// UIU TA Management System
// ========================================================

const API = "../api";

function getUser() {
    try { return JSON.parse(localStorage.getItem("uiu_user")) || null; }
    catch (e) { return null; }
}

function requireAdminLogin() {
    const user = getUser();
    if (!user || user.role !== "admin") {
        alert("Access denied. Admin only.");
        window.location.href = "../kazol/login.html";
        return null;
    }
    
    fetch(`${API}/auth.php`)
        .then(r => r.json())
        .then(data => {
            if (!data.success || data.user.role !== "admin") {
                localStorage.removeItem("uiu_user");
                window.location.href = "../kazol/login.html";
            }
        }).catch(() => {});

    return user;
}

function showNotice(msg, type="success") {
    let notice = document.getElementById("js-notice");
    if (!notice) {
        notice = document.createElement("div");
        notice.id = "js-notice";
        notice.style.cssText = `
            position:fixed; top:20px; right:20px; z-index:9999;
            padding:12px 20px; border-radius:8px; font-size:14px;
            font-weight:600; color:#fff; max-width:350px;
            box-shadow:0 4px 15px rgba(0,0,0,0.2); transition:opacity 0.4s;
        `;
        document.body.appendChild(notice);
    }
    notice.style.background = type === "success" ? "#2e7d32" : (type === "error" ? "#c62828" : "#17437a");
    notice.textContent = msg;
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

document.addEventListener("DOMContentLoaded", function() {
    const user = requireAdminLogin();
    if (!user) return;

    // Profile updates
    document.querySelectorAll(".dashboard-style-5").forEach(el => el.textContent = user.name || "Admin");
    document.querySelectorAll(".sidebar-footer .nav-item").forEach(el => {
        if(el.textContent.includes("Dr.")) el.innerHTML = `<span>👤</span> ${user.name}`;
    });
    const logoutBtn = document.querySelector(".logout-btn");
    if(logoutBtn) {
        logoutBtn.href = "#";
        logoutBtn.addEventListener("click", e => { e.preventDefault(); logout(); });
    }

    const path = window.location.pathname;

    if (path.includes("admin-dashboard.html")) initDashboard(user);
    else if (path.includes("create-vacancy.html")) initCreateVacancy(user);
    else if (path.includes("shortlist-candidates.html")) initShortlist(user);
    else if (path.includes("appointment-letter.html")) initAppointmentLetter(user);
    else if (path.includes("verify-students.html")) initVerifyStudents(user);
});

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────
function initDashboard(user) {
    // Stats
    fetch(`${API}/stats.php`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            const s = data.stats;
            const h2s = document.querySelectorAll(".stat-box h2");
            if(h2s[0]) h2s[0].textContent = s.open_vacancies;
            if(h2s[1]) h2s[1].textContent = s.pending_apps;
            if(h2s[2]) h2s[2].textContent = s.shortlisted;
            if(h2s[3]) h2s[3].textContent = s.appointment_letters;
        });

    // Vacancies table
    fetch(`${API}/vacancies.php`)
        .then(r => r.json())
        .then(data => {
            const tbody = document.querySelector("table tbody");
            if (!tbody) return;
            tbody.innerHTML = "";
            if (!data.success || data.vacancies.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;">No active vacancies. <a href="create-vacancy.html" style="color:#17437a;">Post one →</a></td></tr>`;
                return;
            }
            
            data.vacancies.forEach(v => {
                const badge = v.status === "Open" ? "badge-shortlisted" : (v.status === "Closed" ? "badge-completed" : "badge-pending");
                const deadlineFmt = v.deadline ? new Date(v.deadline).toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"}) : "—";
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>
                        <div class="student-info">
                            <div>
                                <div class="student-name">${v.course_code} — ${v.course_title}</div>
                                <div class="student-id">${v.term}</div>
                            </div>
                        </div>
                    </td>
                    <td class="dashboard-style-19">${v.positions}</td>
                    <td class="dashboard-style-19">-</td>
                    <td>${deadlineFmt}</td>
                    <td><span class="badge ${badge}">${v.status}</span></td>
                    <td><a href="shortlist-candidates.html" class="action-link">Manage →</a></td>
                `;
                tbody.appendChild(tr);
            });
        });

    // Recent Activity — pull from appointment letters
    fetch(`${API}/letters.php`)
        .then(r => r.json())
        .then(data => {
            const actTbody = document.getElementById("activity-tbody");
            if (!actTbody) return;
            actTbody.innerHTML = "";

            if (!data.success || data.letters.length === 0) {
                actTbody.innerHTML = `<tr><td style="padding:16px; color:#888;">No recent activity yet.</td></tr>`;
                return;
            }

            data.letters.slice(0, 5).forEach(l => {
                const issued = new Date(l.issued_at);
                const timeStr = issued.toLocaleString("en-US", {hour:"numeric", minute:"2-digit", hour12:true});
                const dateStr = issued.toLocaleDateString("en-US", {weekday:"short", month:"short", day:"numeric"});
                const now = new Date();
                const diffMs = now - issued;
                const displayTime = diffMs < 86400000 ? timeStr : `${dateStr}, ${timeStr}`;

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="dashboard-style-19" style="width:180px; color:#555; white-space:nowrap;">${displayTime}</td>
                    <td>Appointment letter for <strong>${l.student_name}</strong> (${l.course_title}) was generated.</td>
                `;
                actTbody.appendChild(tr);
            });

    // Pending Student Verifications (Dashboard)
    function loadDashboardVerifications() {
        const unverifiedTbody = document.getElementById("unverified-students-tbody");
        if (!unverifiedTbody) return;

        fetch(`${API}/users.php?role=student&status=unverified`)
            .then(r => r.json())
            .then(data => {
                unverifiedTbody.innerHTML = "";
                
                if (!data.success || data.users.length === 0) {
                    unverifiedTbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;color:#888;">All caught up! No pending verifications.</td></tr>`;
                    return;
                }
                
                // Show only top 5 on dashboard
                data.users.slice(0, 5).forEach(s => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>
                            <div class="student-info">
                                <div>
                                    <div class="student-name">${s.name}</div>
                                    <div class="student-id">${s.university_id || s.email}</div>
                                </div>
                            </div>
                        </td>
                        <td>${s.department || "N/A"}</td>
                        <td>
                            <input type="number" step="0.01" min="0" max="4.00" class="form-control cgpa-input" value="${s.cgpa || ''}" style="width: 80px; padding: 4px;">
                        </td>
                        <td>
                            <button class="btn btn-outline verify-btn" data-id="${s.id}" style="color:#17437a; border-color:#17437a; padding:4px 10px; font-size:13px;">Verify & Save</button>
                        </td>
                    `;
                    unverifiedTbody.appendChild(tr);
                });
                
                // Add event listeners
                unverifiedTbody.querySelectorAll(".verify-btn").forEach(btn => {
                    btn.addEventListener("click", function() {
                        const tr = this.closest("tr");
                        const userId = this.getAttribute("data-id");
                        const cgpaInput = tr.querySelector(".cgpa-input");
                        const cgpaVal = cgpaInput.value.trim();
                        
                        if (!cgpaVal) {
                            alert("Please enter a valid CGPA before verifying.");
                            cgpaInput.focus();
                            return;
                        }
                        
                        this.textContent = "Saving...";
                        this.disabled = true;
                        
                        fetch(`${API}/users.php?action=verify`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ user_id: userId, cgpa: cgpaVal, action: "verify" })
                        })
                        .then(r => r.json())
                        .then(res => {
                            if (res.success) {
                                showNotice("Student verified successfully!");
                                loadDashboardVerifications(); // Reload the list
                            } else {
                                alert(res.message);
                                this.textContent = "Verify & Save";
                                this.disabled = false;
                            }
                        });
                    });
                });
            }).catch(() => {});
    }
    loadDashboardVerifications();
        }).catch(() => {});
} // end initDashboard

// ─── CREATE VACANCY ───────────────────────────────────────────────
function initCreateVacancy(user) {
    // Target the dedicated publish button (NOT an anchor that would navigate away)
    const publishBtn = document.getElementById("publish-btn");
    if (!publishBtn) return;

    publishBtn.addEventListener("click", function(e) {
        e.preventDefault();
        
        const code = document.getElementById("course-code")?.value.trim();
        const title = document.getElementById("course-title")?.value.trim();
        const term = document.getElementById("term")?.value;
        const positions = document.getElementById("positions")?.value;
        const hours = document.getElementById("hours")?.value;
        const stipend = document.getElementById("stipend")?.value;
        const cgpa = document.getElementById("cgpa")?.value;
        const year = document.getElementById("year")?.value;
        const prereq = document.getElementById("prereq")?.checked ? 1 : 0;
        const priority = document.getElementById("priority")?.checked ? 1 : 0;
        const resp = document.getElementById("responsibilities")?.value.trim();
        const deadline = document.getElementById("deadline")?.value;
        const start = document.getElementById("start")?.value;

        if (!code || !title) {
            alert("Please fill in at least the course code and title.");
            return;
        }
        
        if (!deadline) {
            alert("Please set an application deadline.");
            return;
        }

        this.disabled = true;
        this.textContent = "Publishing...";

        fetch(`${API}/vacancies.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                course_code: code,
                course_title: title,
                instructor_name: user.name,
                term: term,
                positions: parseInt(positions) || 2,
                weekly_hours: parseInt(hours) || 10,
                stipend: parseFloat(stipend) || 8000,
                min_cgpa: parseFloat(cgpa) || 3.50,
                min_year: year,
                prereq: prereq,
                priority: priority,
                responsibilities: resp,
                deadline: deadline,
                start_date: start || deadline,
                status: "Open"  // Always set to Open so students see it immediately
            })
        })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                alert("Vacancy published successfully! Students can now see and apply for this position.");
                window.location.href = "admin-dashboard.html";
            } else {
                alert(res.message || "Error saving vacancy.");
                this.disabled = false;
                this.textContent = "Publish Vacancy";
            }
        })
        .catch(err => {
            alert("Network error. Please check your connection and try again.");
            this.disabled = false;
            this.textContent = "Publish Vacancy";
        });
    });
}

// ─── SHORTLIST CANDIDATES ─────────────────────────────────────────
function initShortlist(user) {
    const tbody = document.querySelector("table tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;">Loading applicants...</td></tr>`;

    fetch(`${API}/applications.php`)
        .then(r => r.json())
        .then(data => {
            tbody.innerHTML = "";
            if (!data.success || data.applications.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;">No applications found.</td></tr>`;
                return;
            }

            data.applications.forEach(app => {
                let statusClass = "badge-pending";
                let statusText = app.status;
                if (app.status === "Shortlisted") statusClass = "badge-shortlisted";
                else if (app.status === "Interview Scheduled") statusClass = "badge-interview";
                else if (app.status === "Selected") statusClass = "badge-completed";
                else if (app.status === "Rejected") statusClass = "badge-rejected";

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><input type="checkbox" class="app-checkbox" data-id="${app.id}" style="accent-color:#17437a;"></td>
                    <td>
                        <div class="student-info">
                            <div>
                                <div class="student-name">${app.student_name}</div>
                                <div class="student-id">ID ${app.student_uni_id} · ${app.email}</div>
                                <div style="font-size:11px;color:#888;">${app.course_code} - ${app.course_title}</div>
                            </div>
                        </div>
                    </td>
                    <td class="dashboard-style-19">${parseFloat(app.cgpa).toFixed(2)}</td>
                    <td>-</td>
                    <td>${app.skills ? 'Yes' : 'No'}</td>
                    <td><strong>-</strong></td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                `;
                tbody.appendChild(tr);
            });
        });

    // Move selected to shortlist
    const btnPrimary = document.querySelector("a.btn-primary");
    if (btnPrimary) {
        btnPrimary.addEventListener("click", function(e) {
            e.preventDefault();
            const checked = document.querySelectorAll(".app-checkbox:checked");
            if (checked.length === 0) {
                alert("Please select at least one applicant.");
                return;
            }
            
            const promises = Array.from(checked).map(cb => {
                return fetch(`${API}/applications.php?action=status`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ application_id: cb.getAttribute("data-id"), status: "Shortlisted", action: "status" })
                }).then(r => r.json());
            });

            Promise.all(promises).then(() => {
                alert("Selected candidates moved to shortlist!");
                initShortlist(user); // reload table
            }).catch(() => alert("Error updating status."));
        });
    }

    // Select all checkbox
    const selectAll = document.querySelector("table thead input[type='checkbox']");
    if (selectAll) {
        selectAll.addEventListener("change", function() {
            document.querySelectorAll(".app-checkbox").forEach(box => box.checked = selectAll.checked);
        });
    }
}

// ─── APPOINTMENT LETTERS ──────────────────────────────────────────
function initAppointmentLetter(user) {
    const candidateSelect = document.getElementById("candidate");
    if (!candidateSelect) return;

    candidateSelect.innerHTML = "<option value=''>Loading candidates...</option>";

    let applications = [];

    // Load Shortlisted or Interview Scheduled candidates
    fetch(`${API}/applications.php`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            candidateSelect.innerHTML = "<option value=''>Select a candidate</option>";
            
            // Only Selected candidates get appointment letters usually, but allowing Shortlisted/Interview for testing flow
            applications = data.applications.filter(a => a.status === "Shortlisted" || a.status === "Interview Scheduled" || a.status === "Selected");
            
            applications.forEach(a => {
                const opt = document.createElement("option");
                opt.value = a.id;
                opt.textContent = `${a.student_name} — ${a.course_code}`;
                candidateSelect.appendChild(opt);
            });
        });

    function updatePreview() {
        const appId = candidateSelect.value;
        const app = applications.find(a => a.id == appId);
        if (!app) return;

        // Auto-fill form fields
        document.getElementById("position-title").value = `Teaching Assistant, ${app.course_code} — ${app.course_title}`;
        document.getElementById("letter-hours").value = app.weekly_hours || 10;
        document.getElementById("letter-stipend").value = app.stipend || 8000;
        
        // Setup live preview
        document.getElementById("preview-date").textContent = new Date().toLocaleDateString("en-US", {month:"long", day:"numeric", year:"numeric"});
        document.getElementById("preview-candidate").innerHTML = `${app.student_name}<br>Student ID: ${app.student_uni_id}<br>${app.email}`;
        document.getElementById("preview-greeting").textContent = `Dear ${app.student_name.split(' ')[0]},`;
        
        const renderPreview = () => {
            document.getElementById("preview-title").textContent = document.getElementById("position-title").value;
            document.getElementById("preview-hours").textContent = `${document.getElementById("letter-hours").value} hours per week`;
            document.getElementById("preview-start").textContent = document.getElementById("letter-start").value || "—";
            document.getElementById("preview-end").textContent = document.getElementById("letter-end").value || "—";
            document.getElementById("preview-stipend").textContent = `BDT ${document.getElementById("letter-stipend").value}`;
            document.getElementById("preview-supervisor").textContent = document.getElementById("report-to").value || "the assigned faculty";
            
            const start = document.getElementById("letter-start").value;
            if (start) {
                const d = new Date(start);
                d.setDate(d.getDate() - 7);
                document.getElementById("preview-deadline").textContent = d.toLocaleDateString("en-US", {month:"long", day:"numeric", year:"numeric"});
            }
        };

        // Attach listeners for live update
        const inputs = ["position-title", "letter-hours", "letter-stipend", "letter-start", "letter-end", "report-to"];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener("input", renderPreview);
        });
        
        renderPreview();
    }

    // Update letter preview when candidate is selected
    candidateSelect.addEventListener("change", updatePreview);

    // Generate & send button
    const generateBtn = document.getElementById("generate-btn");
    const statusMsg = document.getElementById("letter-status-msg");

    if (generateBtn) {
        generateBtn.addEventListener("click", function() {
            const appId = candidateSelect.value;
            const app = applications.find(a => a.id == appId);
            
            if (!app) {
                alert("Please select a candidate first.");
                return;
            }

            this.disabled = true;
            this.textContent = "Generating...";

            fetch(`${API}/letters.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_name: app.student_name,
                    student_uni_id: app.student_uni_id,
                    course_title: document.getElementById("position-title").value,
                    weekly_hours: document.getElementById("letter-hours").value,
                    stipend: document.getElementById("letter-stipend").value,
                    start_date: document.getElementById("letter-start").value,
                    end_date: document.getElementById("letter-end").value,
                    reports_to: document.getElementById("report-to").value
                })
            })
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    if(statusMsg) {
                        statusMsg.style.display = "block";
                        statusMsg.style.background = "#e8f5e9";
                        statusMsg.style.color = "#2e7d32";
                        statusMsg.textContent = `✓ Appointment Letter saved! Ref: ${res.ref_no}`;
                    }
                    document.getElementById("preview-ref").innerHTML = `Ref: ${res.ref_no}&nbsp;·&nbsp; Date: <span id="preview-date">${new Date().toLocaleDateString()}</span>`;
                    this.textContent = "✓ Letter Issued";
                    this.style.background = "#2e7d32";
                } else {
                    if(statusMsg) {
                        statusMsg.style.display = "block";
                        statusMsg.style.background = "#ffebee";
                        statusMsg.style.color = "#c62828";
                        statusMsg.textContent = "Error: " + res.message;
                    }
                    this.disabled = false;
                    this.textContent = "Generate & Save";
                }
            })
            .catch(() => {
                this.disabled = false;
                this.textContent = "Generate & Save";
            });
        });
    }

    // Print button
    const printBtn = document.createElement("button");
    printBtn.type = "button";
    printBtn.className = "btn btn-outline";
    printBtn.innerText = "🖨️ Print";
    printBtn.addEventListener("click", () => window.print());
    
    const formActionsDiv = document.querySelector(".form-actions div");
    if (formActionsDiv) {
        formActionsDiv.prepend(printBtn);
    }
}


// ─── VERIFY STUDENTS ──────────────────────────────────────────────
function initVerifyStudents(user) {
    const tbody = document.getElementById("verify-tbody");
    const filter = document.getElementById("verify-status-filter");
    if (!tbody) return;

    function loadStudents(status = "unverified") {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#888;">Loading students...</td></tr>`;
        
        fetch(`${API}/users.php?role=student&status=${status}`)
            .then(r => r.json())
            .then(data => {
                tbody.innerHTML = "";
                if (!data.success || data.users.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#888;">No students found for this status.</td></tr>`;
                    return;
                }
                
                data.users.forEach(s => {
                    const tr = document.createElement("tr");
                    const isVer = s.is_verified == 1;
                    const badge = isVer ? `<span class="badge badge-completed">Verified</span>` : `<span class="badge badge-pending">Unverified</span>`;
                    
                    tr.innerHTML = `
                        <td>
                            <div class="student-info">
                                <div>
                                    <div class="student-name">${s.name}</div>
                                    <div class="student-id">${s.university_id || s.email}</div>
                                </div>
                            </div>
                        </td>
                        <td>${s.department || "N/A"}</td>
                        <td>
                            <input type="number" step="0.01" min="0" max="4.00" class="form-control cgpa-input" value="${s.cgpa || ''}" style="width: 80px; padding: 4px;" ${isVer ? "readonly" : ""}>
                        </td>
                        <td>${badge}</td>
                        <td>
                            ${isVer ? `<span style="color:#2e7d32;font-size:13px;">✔ Verified</span>` : `<button class="btn btn-outline verify-btn" data-id="${s.id}" style="color:#17437a; border-color:#17437a; padding:4px 10px; font-size:13px;">Verify & Save</button>`}
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                
                // Add event listeners to verify buttons
                tbody.querySelectorAll(".verify-btn").forEach(btn => {
                    btn.addEventListener("click", function() {
                        const tr = this.closest("tr");
                        const userId = this.getAttribute("data-id");
                        const cgpaInput = tr.querySelector(".cgpa-input");
                        const cgpaVal = cgpaInput.value.trim();
                        
                        if (!cgpaVal) {
                            alert("Please enter a valid CGPA before verifying.");
                            cgpaInput.focus();
                            return;
                        }
                        
                        this.textContent = "Saving...";
                        this.disabled = true;
                        
                        fetch(`${API}/users.php?action=verify`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ user_id: userId, cgpa: cgpaVal, action: "verify" })
                        })
                        .then(r => r.json())
                        .then(res => {
                            if (res.success) {
                                showNotice(res.message);
                                loadStudents(filter.value);
                            } else {
                                alert(res.message);
                                this.textContent = "Verify & Save";
                                this.disabled = false;
                            }
                        });
                    });
                });
            });
    }

    if (filter) {
        filter.addEventListener("change", (e) => loadStudents(e.target.value));
    }
    
    loadStudents("unverified");
}