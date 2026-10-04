document.addEventListener("DOMContentLoaded", function() {
    let searchInput = document.querySelector(".applicants-style-22");
    if (searchInput) {
        searchInput.addEventListener("input", function() {
            let filter = searchInput.value.toLowerCase();
            let rows = document.querySelectorAll("table tbody tr");
            rows.forEach(function(row) {
                let text = row.innerText.toLowerCase();
                row.style.display = text.includes(filter) ? "" : "none";
            });
        });
    }

    let shortlistBtn = document.querySelector(".applicants-style-25");
    if (shortlistBtn) {
        shortlistBtn.addEventListener("click", function() {
            let rows = document.querySelectorAll("table tbody tr");
            rows.forEach(function(row) {
                let badge = row.querySelector(".badge");
                if (badge) {
                    badge.className = "badge badge-shortlisted";
                    badge.innerText = "Shortlisted";
                }
            });
            alert("Selected applicants have been shortlisted!");
        });
    }

    let addShortlistBtns = document.querySelectorAll("table tbody tr button");
    addShortlistBtns.forEach(function(btn) {
        if (btn.innerText.includes("Shortlist")) {
            btn.addEventListener("click", function() {
                let row = btn.closest("tr");
                let name = row.querySelector(".student-name").innerText;
                btn.innerText = "✓ Shortlisted";
                btn.disabled = true;
                btn.style.background = "#2e7d32";
                alert(name + " has been added to the shortlist!");
            });
        }
    });

    let cgpaFilter = document.querySelector(".shortlist-style-30");
    if (cgpaFilter) {
        cgpaFilter.style.cursor = "pointer";
        let isFiltered = false;
        cgpaFilter.addEventListener("click", function() {
            isFiltered = !isFiltered;
            cgpaFilter.querySelector("span").innerText = isFiltered ? "Reset Filter" : "Filter by CGPA";
            let rows = document.querySelectorAll("table tbody tr");
            rows.forEach(function(row) {
                let cgpa = parseFloat(row.querySelectorAll("td")[1].innerText);
                if (isFiltered && cgpa < 3.70) {
                    row.style.display = "none";
                } else {
                    row.style.display = "";
                }
            });
        });
    }

    let scheduleBtn = document.querySelector(".interviews-style-4");
    if (scheduleBtn) {
        scheduleBtn.addEventListener("click", function() {
            let student = prompt("Enter Student Name for Interview:", "Nusrat Jahan");
            if (student) {
                let date = prompt("Enter Date (e.g. 25 August 2026):", "25 August 2026");
                let time = prompt("Enter Time (e.g. 11:30 AM):", "11:30 AM");
                
                let tbody = document.querySelector("table tbody");
                let newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <td>
                        <div class="student-info">
                            <div class="student-initials">ST</div>
                            <div>
                                <div class="student-name">${student}</div>
                                <div class="student-id">ID: 011 222 99887</div>
                            </div>
                        </div>
                    </td>
                    <td>Web Programming</td>
                    <td>
                        <div>${date || "25 August 2026"}</div>
                        <div style="font-size:12px; color:#666;">🕒 ${time || "11:30 AM"}</div>
                    </td>
                    <td>📍 Room 836 (A)</td>
                    <td><span style="color:#2e7d32;">● Scheduled</span></td>
                    <td><a class="action-link" href="#" onclick="alert('Interview Completed!'); this.innerText='Completed'; return false;">Mark Done</a></td>
                `;
                tbody.prepend(newRow);
                alert("Interview scheduled successfully for " + student);
            }
        });
    }

    let stars = document.querySelectorAll(".rating-stars span");
    stars.forEach(function(star, index) {
        star.style.cursor = "pointer";
        star.addEventListener("click", function() {
            stars.forEach(function(s, i) {
                s.style.color = i <= index ? "#ff9800" : "#ddd";
            });
        });
    });

    let reviewSubmitBtn = document.querySelector("#formContent button.btn-primary");
    if (reviewSubmitBtn) {
        reviewSubmitBtn.removeAttribute("onclick");
        reviewSubmitBtn.addEventListener("click", function() {
            let taName = document.getElementById("taName") ? document.getElementById("taName").innerText : "TA";
            alert("Review for " + taName + " submitted successfully!");
            
            let rows = document.querySelectorAll("table tbody tr");
            rows.forEach(function(row) {
                if (row.innerText.includes(taName)) {
                    let badge = row.querySelector(".badge");
                    if (badge) {
                        badge.className = "badge badge-completed";
                        badge.innerText = "Reviewed";
                    }
                }
            });
        });
    }


    if (window.location.pathname.includes("applicants.html")) {
        fetch("../api/applications.php")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    let tbody = document.querySelector("table tbody");

                    tbody.innerHTML = '';
                    
                    data.applications.forEach(app => {
                        let tr = document.createElement("tr");
                        let statusClass = "badge-pending";
                        if (app.status === "Shortlisted") statusClass = "badge-shortlisted";
                        
                        let initials = app.student_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                        if (!initials) initials = "ST";

                        tr.innerHTML = `
                            <td>
                                <div class="student-info">
                                    <div class="student-initials">${initials}</div>
                                    <div>
                                        <div class="student-name">${app.student_name}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="applicants-style-2">${app.student_uni_id}</td>
                            <td class="applicants-style-23">${parseFloat(app.cgpa).toFixed(2)}</td>
                            <td><span class="badge ${statusClass}">${app.status}</span></td>
                            <td><button class="action-link btn-shortlist" data-id="${app.id}" style="background:none; border:none; cursor:pointer; color:#17437a; font-weight:600;">View / Shortlist</button></td>
                        `;
                        tbody.appendChild(tr);
                    });


                    document.querySelectorAll('.btn-shortlist').forEach(btn => {
                        btn.addEventListener("click", function(e) {
                            e.preventDefault();
                            let appId = this.getAttribute("data-id");
                            fetch("../api/applications.php?action=status", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ application_id: appId, status: "Shortlisted", action: "status" })
                            }).then(() => {
                                window.location.reload();
                            });
                        });
                    });
                }
            })
            .catch(err => console.error("Error fetching applicants:", err));
    }
});
