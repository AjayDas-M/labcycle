const labListEl = document.querySelector("#lab-list");
const emptyEl = document.querySelector("#empty-message");
const filterInputs = document.querySelectorAll("[data-filter]");
const searchEl = document.querySelector("#search");

// Enter key must not reload page
searchEl.closest("form").addEventListener("submit", e => e.preventDefault());
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
    const query = searchEl.value.trim().toLowerCase();
    const bookmarkOnly = getSelected("bookmark").length > 0;

    const result = labs.filter(lab => {
        const statusOk = statuses.length === 0 ||
            statuses.includes(lab.solved ? "solved" : "unsolved");
        const difficultyOk = difficulties.length === 0 ||
            difficulties.includes(lab.difficulty.toLowerCase());
        const searchOk = lab.title.toLowerCase().includes(query);
        const bookmarkOk = !bookmarkOnly || bookmarks.has(lab.id);
        return statusOk && difficultyOk && searchOk && bookmarkOk;
        
    });

    renderLabs(result);
}

filterInputs.forEach(input => input.addEventListener("change", applyFilters));
searchEl.addEventListener("input", applyFilters);
const STORAGE_KEY = "labcycle:bookmarks";

// localStorage is user-editable: never trust it. Validate shape, catch errors.
function loadBookmarks() {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return new Set(Array.isArray(raw) ? raw.filter(Number.isInteger) : []);
    } catch {
        return new Set(); // bad JSON or storage blocked
    }
}

function saveBookmarks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...bookmarks]));
    } catch {
        // storage full or blocked: app still works, just no memory
    }
}

const bookmarks = loadBookmarks();

// Flip bookmark for one lab id. Returns new state.
function toggleBookmark(id) {
    if (bookmarks.has(id)) {
        bookmarks.delete(id);
    } else {
        bookmarks.add(id);
    }
    saveBookmarks();
    return bookmarks.has(id);
}

// Sync star look with state.
function paintStar(star, marked) {
    star.textContent = marked ? "★" : "☆";
    star.classList.toggle("active", marked);
    star.setAttribute("aria-pressed", String(marked));
}

applyFilters(); // first draw