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

    const loginBtn = document.getElementById("login-btn") || document.querySelector(".btn-primary");
    const originalText = loginBtn ? loginBtn.innerText : "Login";
    if (loginBtn) {
        loginBtn.innerText = "Logging in...";
        loginBtn.style.pointerEvents = "none";
    }

    fetch("../api/auth.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass, role: currentRole })
    })
    .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
    })
    .then(data => {
        if (data.success) {
            // Store user context in localStorage for client-side use
            localStorage.setItem("uiu_user", JSON.stringify(data.user));
            // Redirect using the role-based path provided by auth.php
            window.location.href = data.redirect;
        } else {
            alert(data.message || "Invalid credentials!");
            if (loginBtn) {
                loginBtn.innerText = originalText;
                loginBtn.style.pointerEvents = "auto";
            }
        }
    })
    .catch(err => {
        alert("Server error. Please check your connection and try again.");
        if (loginBtn) {
            loginBtn.innerText = originalText;
            loginBtn.style.pointerEvents = "auto";
        }
    });
}

// REGISTRATION LOGIC
function toggleReg(role) {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("register-section").classList.remove("hidden");
    
    document.getElementById("reg-role").value = role;
    document.getElementById("reg-role-text").innerText = role === 'faculty' ? 'teacher/faculty' : 'student';
    document.getElementById("reg-id-label").innerText = role === 'faculty' ? 'Teacher/Faculty ID' : 'Student ID';
    document.getElementById("reg-id").placeholder = role === 'faculty' ? 'e.g. FAC-082' : 'e.g. 011222146';
    
    const cgpaGroup = document.getElementById("reg-cgpa-group");
    if (cgpaGroup) {
        cgpaGroup.style.display = role === 'faculty' ? 'none' : 'block';
    }
}

function toggleLogin() {
    document.getElementById("register-section").classList.add("hidden");
    document.getElementById("login-section").classList.remove("hidden");
}

function handleRegister() {
    const role = document.getElementById("reg-role").value;
    const identifier = document.getElementById("reg-id").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const pass = document.getElementById("reg-pass").value;
    const pass2 = document.getElementById("reg-pass2").value;
    const cgpaVal = document.getElementById("reg-cgpa") ? document.getElementById("reg-cgpa").value.trim() : "";
    const cgpa = (role === 'student' && cgpaVal) ? parseFloat(cgpaVal) : null;

    if (!identifier || !email || !pass || !pass2) {
        alert("Please fill in all required fields.");
        return;
    }

    if (role === 'student' && !cgpaVal) {
        alert("Please enter your CGPA.");
        return;
    }

    if (pass !== pass2) {
        alert("Passwords do not match.");
        return;
    }

    if (pass.length < 4) {
        alert("Password must be at least 4 characters.");
        return;
    }

    const regBtn = document.getElementById("reg-btn");
    const originalText = regBtn.innerText;
    regBtn.innerText = "Registering...";
    regBtn.style.pointerEvents = "none";

    fetch("../api/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: role, identifier: identifier, email: email, password: pass, cgpa: cgpa })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            // Switch back to login and auto-fill
            toggleLogin();
            document.getElementById("username").value = email;
            document.getElementById("password").value = "";
            // Switch role selector
            const options = document.querySelectorAll(".role-option");
            options.forEach(opt => opt.classList.remove("active"));
            options.forEach(opt => {
                if(opt.innerText.toLowerCase().includes(role)) {
                    opt.classList.add("active");
                    currentRole = role;
                }
            });
        } else {
            alert(data.message);
        }
        regBtn.innerText = originalText;
        regBtn.style.pointerEvents = "auto";
    })
    .catch(err => {
        alert("Network error.");
        regBtn.innerText = originalText;
        regBtn.style.pointerEvents = "auto";
    });
}
