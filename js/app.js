const labListEl = document.querySelector("#lab-list");
const emptyEl = document.querySelector("#empty-message");
const filterInputs = document.querySelectorAll("[data-filter]");

// Build one <li> card from one lab object.
// textContent / append(string) only: data never parsed as HTML (no XSS).
function createLabCard(lab) {
    const li = document.createElement("li");

    const card = document.createElement("article");
    card.className = "lab-card";

    // left side: title + meta line
    const info = document.createElement("div");
    info.className = "lab-info";

    const title = document.createElement("h2");
    title.textContent = lab.title;

    const meta = document.createElement("p");
    meta.className = "meta";

    const difficulty = document.createElement("span");
    difficulty.className = `difficulty ${lab.difficulty.toLowerCase()}`;
    difficulty.textContent = lab.difficulty;

    meta.append(difficulty, ` | Max Score: ${lab.maxScore} | LAB ${lab.lab}`);
    info.append(title, meta);

    // right side: status, star, solve
    const actions = document.createElement("div");
    actions.className = "lab-actions";

    const status = document.createElement("span");
    status.className = `status ${lab.solved ? "solved" : "unsolved"}`;
    status.textContent = lab.solved ? "Solved" : "Unsolved";

    const star = document.createElement("button");
    star.type = "button";
    star.className = "star-btn";
    star.setAttribute("aria-label", `Bookmark ${lab.title}`);
    star.textContent = "☆";

    const solve = document.createElement("button");
    solve.type = "button";
    solve.className = "solve-btn";
    solve.textContent = "Solve";

    actions.append(status, star, solve);
    card.append(info, actions);
    li.append(card);
    return li;
}

// Clear list, draw given labs, toggle empty message.
function renderLabs(list) {
    labListEl.replaceChildren();
    list.forEach(lab => labListEl.append(createLabCard(lab)));
    emptyEl.hidden = list.length > 0;
}

// Values of checked boxes in one filter group, e.g. ["easy", "hard"].
function getSelected(group) {
    const checked = document.querySelectorAll(`[data-filter="${group}"]:checked`);
    return [...checked].map(input => input.value);
}

// Rule: group with nothing checked = no restriction. Between groups = AND.
function applyFilters() {
    const statuses = getSelected("status");
    const difficulties = getSelected("difficulty");

    const result = labs.filter(lab => {
        const statusOk = statuses.length === 0 ||
            statuses.includes(lab.solved ? "solved" : "unsolved");
        const difficultyOk = difficulties.length === 0 ||
            difficulties.includes(lab.difficulty.toLowerCase());
        return statusOk && difficultyOk;
    });

    renderLabs(result);
}

filterInputs.forEach(input => input.addEventListener("change", applyFilters));

applyFilters(); // first draw