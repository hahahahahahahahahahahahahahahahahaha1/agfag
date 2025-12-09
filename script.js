/* ==========================================================
   MULTI-ARTIST LOCALSTORAGE SYSTEM
========================================================== */

function loadArtists() {
  return JSON.parse(localStorage.getItem("artists") || "{}");
}

function saveArtists(data) {
  localStorage.setItem("artists", JSON.stringify(data));
}

function getCurrentUser() {
  return localStorage.getItem("currentUser");
}

function getArtistData() {
  const user = getCurrentUser();
  const artists = loadArtists();
  if (!user || !artists[user]) return null;
  return artists[user];
}

function updateArtistData(callback) {
  const user = getCurrentUser();
  const artists = loadArtists();
  if (!user || !artists[user]) return;
  callback(artists[user]);
  saveArtists(artists);
}

/* ==========================================================
   ARTIST PROFILE
========================================================== */
function loadProfile() {
  const artist = getArtistData();
  if (!artist) return alert("No artist logged in!");

  document.getElementById("artistName").value = artist.profile.name;
  document.getElementById("artistBio").value = artist.profile.bio;

  document.getElementById("profilePic").src =
    artist.profile.profilePic || "https://via.placeholder.com/200x200?text=Profile+Pic";
}

function saveProfile() {
  updateArtistData(artist => {
    artist.profile.name = document.getElementById("artistName").value;
    artist.profile.bio = document.getElementById("artistBio").value;
  });
  alert("Profile saved!");
}

function saveProfilePic() {
  const file = document.getElementById("profilePicInput").files[0];
  if (!file) return alert("Please choose an image first!");
  const reader = new FileReader();
  reader.onload = () => {
    updateArtistData(artist => { artist.profile.profilePic = reader.result; });
    document.getElementById("profilePic").src = reader.result;
    alert("Profile picture updated!");
  };
  reader.readAsDataURL(file);
}

/* ==========================================================
   ARTWORK UPLOAD + DELETE
========================================================== */
function addArtwork() {
  const file = document.getElementById("artInput").files[0];
  const title = document.getElementById("artTitle").value.trim();
  const desc = document.getElementById("artDesc").value.trim();
  if (!file) return alert("Select an artwork first!");
  if (!title) return alert("Enter artwork title!");

  const reader = new FileReader();
  reader.onload = () => {
    updateArtistData(artist => {
      if (!artist.artworks) artist.artworks = [];
      artist.artworks.push({ img: reader.result, title: title, desc: desc });
    });
    displayArtworks();
  };
  reader.readAsDataURL(file);
}

function deleteArtwork(index, type="artwork") {
  updateArtistData(artist => {
    if(type === "artwork") artist.artworks.splice(index, 1);
    if(type === "model") artist.models.splice(index, 1);
  });
  displayArtworks();
}

function displayArtworks() {
  const container = document.getElementById("artList");
  if (!container) return;
  const artist = getArtistData();
  if (!artist) return;
  container.innerHTML = "";

  // 2D artworks
  if(artist.artworks) artist.artworks.forEach((art, i) => {
    container.innerHTML += `
      <div class="card">
        <img src="${art.img}">
        <p><strong>${art.title}</strong></p>
        <p>${art.desc}</p>
        <button onclick="deleteArtwork(${i}, 'artwork')">Delete</button>
      </div>
    `;
  });

  // 3D models
  if(artist.models) artist.models.forEach((model, i) => {
    container.innerHTML += `
      <div class="card">
        <p><strong>${model.title}</strong> (3D Model)</p>
        <p>${model.desc}</p>
        <p>${model.name}</p>
        <button onclick="deleteArtwork(${i}, 'model')">Delete</button>
      </div>
    `;
  });
}

/* ==========================================================
   ARTIST PORTFOLIO
========================================================== */
function loadPortfolio() {
  const artist = getArtistData();
  if (!artist) return alert("No artist logged in!");
  document.getElementById("artistDisplayName").textContent =
    artist.profile.name || "Unnamed Artist";
  document.getElementById("artistDisplayBio").textContent =
    artist.profile.bio || "No biography available.";
  document.getElementById("artistPic").src =
    artist.profile.profilePic || "https://via.placeholder.com/200x200?text=Artist";

  const gallery = document.getElementById("artGallery");
  if(!gallery) return;
  gallery.innerHTML = "";

  if(artist.artworks) artist.artworks.forEach(art => {
    const el = document.createElement("img");
    el.src = art.img;
    gallery.appendChild(el);
  });
}

/* ==========================================================
   AR VIEWER 2D (ar.html)
========================================================== */
let arIndex = 0;
function initAR() {
  const artist = getArtistData();
  if (!artist) return alert("No artist logged in!");
  const artworks = artist.artworks || [];
  const assetContainer = document.getElementById("arAssets");
  const plane = document.getElementById("arPlane");
  const titleText = document.getElementById("arTitle");
  const descText = document.getElementById("arDesc");
  if (!assetContainer || !plane) return;

  artworks.forEach((art, i) => {
    const asset = document.createElement("img");
    asset.id = "art-" + i;
    asset.src = art.img;
    assetContainer.appendChild(asset);
  });

  function updateAR() {
    if (artworks.length === 0) return;
    const item = artworks[arIndex];
    plane.setAttribute("src", "#art-" + arIndex);
    titleText.setAttribute("value", item.title || "(Untitled)");
    descText.setAttribute("value", item.desc || "");
  }

  updateAR();

  document.getElementById("prevArt").onclick = () => {
    arIndex = (arIndex - 1 + artworks.length) % artworks.length;
    updateAR();
  };

  document.getElementById("nextArt").onclick = () => {
    arIndex = (arIndex + 1) % artworks.length;
    updateAR();
  };
}
