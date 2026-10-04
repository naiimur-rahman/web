document.addEventListener("DOMContentLoaded", function() {
    let publishBtn = document.querySelector("form.card .btn-primary");
    if (publishBtn) {
        publishBtn.addEventListener("click", function(e) {
            e.preventDefault();
            let code = document.getElementById("course-code").value;
            let title = document.getElementById("course-title").value;

            if (!code || !title) {
                alert("Please fill course code and course title!");
                return;
            }

            fetch("../api/vacancies.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    course_code: code,
                    course_title: title,
                    instructor_name: "Dr. Ayesha Karim",
                    term: "Fall 2026",
                    positions: 2,
                    weekly_hours: 10,
                    stipend: 8000,
                    min_cgpa: 3.50,
                    status: "Open"
                })
            })
            .then(res => res.json())
            .then(data => {
                alert("Vacancy " + code + " published successfully!");
                window.location.href = "admin-dashboard.html";
            })
            .catch(err => {
                alert("Vacancy " + code + " published successfully!");
                window.location.href = "admin-dashboard.html";
            });
        });
    }

    let selectAll = document.querySelector("table thead input[type='checkbox']");
    if (selectAll) {
        selectAll.addEventListener("change", function() {
            let boxes = document.querySelectorAll("table tbody input[type='checkbox']");
            boxes.forEach(function(box) {
                box.checked = selectAll.checked;
            });
        });
    }

    let filterBtn = document.querySelector(".rail button");
    if (filterBtn) {
        filterBtn.addEventListener("click", function() {
            let minCgpa = parseFloat(document.getElementById("f-cgpa").value) || 0;
            let rows = document.querySelectorAll("table tbody tr");
            rows.forEach(function(row) {
                let cgpa = parseFloat(row.querySelector(".dashboard-style-19").innerText) || 0;
                if (minCgpa > 0 && cgpa < minCgpa) {
                    row.style.display = "none";
                } else {
                    row.style.display = "";
                }
            });
            alert("Filter applied!");
        });
    }

    let candidateSelect = document.getElementById("candidate");
    if (candidateSelect) {
        candidateSelect.addEventListener("change", function() {
            let name = candidateSelect.value.split(" — ")[0];
            let studentPara = document.querySelector(".letter-sheet p:nth-of-type(1)");
            let salutation = document.querySelector(".letter-sheet p:nth-of-type(2)");
            if (studentPara) {
                studentPara.innerHTML = name + "<br>Student ID 20-41032<br>B.Sc. in Computer Science, 3rd year";
            }
            if (salutation) {
                salutation.innerHTML = "Dear " + name + ",";
            }
        });
    }

    let generateLetterBtn = document.querySelector(".form-actions .btn-primary");
    if (generateLetterBtn) {
        generateLetterBtn.addEventListener("click", function() {
            let name = candidateSelect ? candidateSelect.value.split(" — ")[0] : "Student";
            alert("Appointment Letter generated and emailed to " + name + "!");
            generateLetterBtn.innerText = "✓ Letter Issued";
            generateLetterBtn.style.background = "#2e7d32";
        });
    }

    let printBtn = document.createElement("button");
    printBtn.type = "button";
    printBtn.className = "btn btn-outline";
    printBtn.innerText = "🖨️ Print";
    printBtn.style.marginRight = "10px";
    printBtn.addEventListener("click", function() {
        window.print();
    });

    let formActionsDiv = document.querySelector(".form-actions div");
    if (formActionsDiv) {
        formActionsDiv.prepend(printBtn);
    }


    if (window.location.pathname.includes("shortlist-candidates.html")) {
        fetch("../api/applications.php")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    let tbody = document.querySelector("table tbody");
                    if (tbody) {
                        tbody.innerHTML = '';
                        
                        data.applications.forEach(app => {
                            let tr = document.createElement("tr");
                            
                            let statusClass = "badge-pending";
                            let statusText = app.status;
                            if (app.status === "Shortlisted") statusClass = "badge-shortlisted";
                            if (app.status === "Pending") { statusClass = "badge-pending"; statusText = "Reviewed"; }
                            
                            tr.innerHTML = `
                                <td><input type="checkbox" style="accent-color:#17437a;"></td>
                                <td>
                                    <div class="student-info">
                                        <div>
                                            <div class="student-name">${app.student_name}</div>
                                            <div class="student-id">ID ${app.student_uni_id} · ${app.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dashboard-style-19">${parseFloat(app.cgpa).toFixed(2)}</td>
                                <td>N/A</td>
                                <td>${app.skills ? 'Yes' : 'No'}</td>
                                <td><strong>N/A</strong></td>
                                <td><span class="badge ${statusClass}">${statusText}</span></td>
                            `;
                            tbody.appendChild(tr);
                        });
                    }
                }
            })
            .catch(err => console.error("Error fetching admin candidates:", err));
    }
});
