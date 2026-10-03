let currentRole = "student";

function selectRole(element) {
    let options = document.querySelectorAll(".role-option");
    options.forEach(opt => opt.classList.remove("active"));
    element.classList.add("active");

    let roleText = element.innerText.toLowerCase();
    let userInput = document.getElementById("username");

    if (roleText.includes("faculty")) {
        currentRole = "faculty";
        userInput.placeholder = "faculty";
    } else if (roleText.includes("admin")) {
        currentRole = "admin";
        userInput.placeholder = "admin";
    } else {
        currentRole = "student";
        userInput.placeholder = "student";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    let eye = document.querySelector(".eye-icon");
    if (eye) {
        eye.style.cursor = "pointer";
        eye.addEventListener("click", function() {
            let pass = document.getElementById("password");
            pass.type = pass.type === "password" ? "text" : "password";
        });
    }

    let passInput = document.getElementById("password");
    if (passInput) {
        passInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") handleLogin();
        });
    }
});

function handleLogin() {
    let user = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value.trim();

    if (user === "" || pass === "") {
        alert("Please enter both username and password!");
        return;
    }

    fetch("../api/auth.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass, role: currentRole })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem("uiu_user", JSON.stringify(data.user));
            window.location.href = data.redirect;
        } else {
            alert(data.message || "Invalid credentials!");
        }
    })
    .catch(err => {
        if (user === "student" && pass === "1234") {
            window.location.href = "../tanjim/student_dashboard.html";
        } else if (user === "faculty" && pass === "1234") {
            window.location.href = "../naimur/dashboard.html";
        } else if (user === "admin" && pass === "1234") {
            window.location.href = "../bappy/admin-dashboard.html";
        } else {
            alert("Invalid login! Use student/1234, faculty/1234, or admin/1234");
        }
    });
}
