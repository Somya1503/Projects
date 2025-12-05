const input = document.getElementById("quoteInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("quoteList");

let quotes = [];

// Load quotes on startup
function loadQuotes() {
  const saved = localStorage.getItem("quotes");
  quotes = saved ? JSON.parse(saved) : [];
  renderQuotes();
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Render all quotes
function renderQuotes() {
  list.innerHTML = "";
  quotes.forEach((quote, index) => {
    const li = document.createElement("li");
    li.textContent = quote;

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "del-btn";
    del.onclick = () => deleteQuote(index);

    li.appendChild(del);
    list.appendChild(li);
  });
}

// Add a quote
addBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;

  quotes.push(text);
  saveQuotes();
  renderQuotes();

  input.value = "";
});

// Delete a quote
function deleteQuote(index) {
  quotes.splice(index, 1);
  saveQuotes();
  renderQuotes();
}

// Initialize
loadQuotes();
