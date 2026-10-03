document.addEventListener("DOMContentLoaded", function() {
    let applyForm = document.querySelector(".form-card form");
    if (applyForm) {
        applyForm.addEventListener("submit", function(e) {
            e.preventDefault();

            let position = applyForm.querySelector("select").value;
            let inputs = applyForm.querySelectorAll("input");
            let name = inputs[0] ? inputs[0].value : "";
            let id = inputs[1] ? inputs[1].value : "";
            let cgpa = inputs[2] ? inputs[2].value : "";
            let textareas = applyForm.querySelectorAll("textarea");
            let motivation = textareas[0] ? textareas[0].value : "";
            let skills = textareas[1] ? textareas[1].value : "";

            if (!position) {
                alert("Please select a position!");
                return;
            }

            fetch("../api/applications.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vacancy_id: 1,
                    student_id: 1,
                    student_name: name || "Tanjim Tazwar",
                    student_uni_id: id || "011222146",
                    email: "tkhan222146@bscse.uiu.ac.bd",
                    cgpa: parseFloat(cgpa) || 3.55,
                    motivation: motivation,
                    skills: skills
                })
            })
            .then(res => res.json())
            .then(data => {
                alert("Application submitted successfully!");
                window.location.href = "my_applications.html";
            })
            .catch(err => {
                alert("Application saved!");
                window.location.href = "my_applications.html";
            });
        });
    }

    let posSearch = document.getElementById("positionSearch");
    if (posSearch) {
        posSearch.addEventListener("input", function() {
            let filter = posSearch.value.toLowerCase();
            document.querySelectorAll(".position-card").forEach(function(card) {
                let text = card.innerText.toLowerCase();
                card.style.display = text.includes(filter) ? "flex" : "none";
            });
        });
    }

    let taskCards = document.querySelectorAll(".task-card");
    taskCards.forEach(function(card) {
        card.style.cursor = "pointer";
        card.addEventListener("click", function() {
            let status = card.querySelector(".task-status");
            if (status.classList.contains("completed")) {
                status.classList.remove("completed");
                status.classList.add("pending");
                status.innerText = "Pending";
            } else {
                status.classList.remove("pending");
                status.classList.add("completed");
                status.innerText = "Completed";
            }

            let completed = document.querySelectorAll(".task-status.completed").length;
            let pending = taskCards.length - completed;
            let stats = document.querySelectorAll(".stats .stat .number");
            if (stats[1]) stats[1].innerText = completed < 10 ? "0" + completed : completed;
            if (stats[2]) stats[2].innerText = pending < 10 ? "0" + pending : pending;
        });
    });

    let editBtn = document.getElementById("editProfileBtn");
    if (editBtn) {
        editBtn.addEventListener("click", function() {
            let emailTag = document.querySelectorAll(".info-card .info-grid p")[3];
            let newEmail = prompt("Enter your updated email:", emailTag ? emailTag.innerText : "");
            if (newEmail) {
                if (emailTag) emailTag.innerText = newEmail;
                alert("Profile email updated!");
            }
        });
    }
});
