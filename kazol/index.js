document.addEventListener("DOMContentLoaded", function() {
    let cards = document.querySelectorAll(".notice-card");
    cards.forEach(function(card) {
        card.style.cursor = "pointer";
        card.addEventListener("click", function() {
            let title = card.querySelector("h5").innerText;
            let desc = card.querySelector("p").innerText;
            alert(title + "\n\n" + desc);
        });
    });

    let viewAll = document.querySelector(".view-all");
    if (viewAll) {
        viewAll.addEventListener("click", function(e) {
            e.preventDefault();
            alert("All Fall 2026 Notices:\n\n1. TA Applications open till Sep 20.\n2. CSE Interviews will start from next week.\n3. Final lists will be published on the notice board.");
        });
    }
});
