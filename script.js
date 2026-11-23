const WATCHLIST_KEY = "movieSystemWatchlist";
let allMovies = [];
let showingWatchlistOnly = false;

function getWatchlist() {
return JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [];
}

function saveWatchlist(watchlist) {
localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
updateWatchlistCount();
}

function updateWatchlistCount() {
const countSpan = document.getElementById("watchlist-count");
if (countSpan) {
countSpan.textContent = getWatchlist().length;
}
}

function toggleWatchlist(movieId) {
let watchlist = getWatchlist();
if (watchlist.includes(movieId)) {
watchlist = watchlist.filter((id) => id !== movieId);
} else {
watchlist.push(movieId);
}
saveWatchlist(watchlist);
applyFilters();
}

function createMovieCard(movie) {
const watchlist = getWatchlist();
const isSaved = watchlist.includes(movie.id);

const card = document.createElement("div");
card.className = "movie-card";

card.innerHTML = `
<div>
<img src="${movie.poster_url}" alt="${movie.title}" />
<div class="movie-info">
<h3><a href="details.html?id=${movie.id}" style="color:inherit;text-decoration:none;">${movie.title}</a></h3>
<div class="movie-meta">
<span>${movie.genre} &bull; ${movie.release_year}</span>
<span class="movie-rating">&#9733; ${movie.rating}</span>
</div>
<p class="movie-overview">${movie.overview}</p>
</div>
</div>
<div class="movie-info">
<button type="button" class="watchlist-btn ${isSaved ? "saved" : ""}" data-id="${movie.id}">
${isSaved ? "✓ In Watchlist" : "+ Add to Watchlist"}
</button>
</div>
`;

const btn = card.querySelector(".watchlist-btn");
btn.addEventListener("click", () => toggleWatchlist(movie.id));

return card;
}

function renderMovies(movies, containerId) {
const container = document.getElementById(containerId);
if (!container) return;

container.innerHTML = "";

if (movies.length === 0) {
container.innerHTML = "<p>No movies found.</p>";
return;
}

movies.forEach((movie) => {
container.appendChild(createMovieCard(movie));
});
}

function applyFilters() {
const searchInput = document.getElementById("search-input");
const genreFilter = document.getElementById("genre-filter");
const heading = document.getElementById("catalog-heading");

if (!document.getElementById("movie-grid")) return;

const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
const selectedGenre = genreFilter ? genreFilter.value : "all";
const watchlist = getWatchlist();

let filtered = allMovies.filter((movie) => {
const matchesTitle = movie.title.toLowerCase().includes(query);
const matchesGenre = selectedGenre === "all" || movie.genre === selectedGenre;
const matchesWatchlist = !showingWatchlistOnly || watchlist.includes(movie.id);
return matchesTitle && matchesGenre && matchesWatchlist;
});

if (heading) {
heading.textContent = showingWatchlistOnly ? "My Saved Watchlist" : "All Movies";
}

renderMovies(filtered, "movie-grid");
}

document.addEventListener("DOMContentLoaded", async () => {
updateWatchlistCount();

try {
const response = await fetch("movies.json");
allMovies = await response.json();

// Render top 3 movies on Home page
if (document.getElementById("featured-grid")) {
renderMovies(allMovies.slice(0, 3), "featured-grid");
}

// Render full catalog on Movies page
if (document.getElementById("movie-grid")) {
renderMovies(allMovies, "movie-grid");
}
} catch (error) {
console.error("Failed to load movies.json:", error);
}

const searchInput = document.getElementById("search-input");
if (searchInput) {
searchInput.addEventListener("input", applyFilters);
}

const genreFilter = document.getElementById("genre-filter");
if (genreFilter) {
genreFilter.addEventListener("change", applyFilters);
}

const toggleWatchlistBtn = document.getElementById("toggle-watchlist-btn");
if (toggleWatchlistBtn) {
toggleWatchlistBtn.addEventListener("click", () => {
showingWatchlistOnly = !showingWatchlistOnly;
toggleWatchlistBtn.classList.toggle("active", showingWatchlistOnly);
applyFilters();
});
}
});