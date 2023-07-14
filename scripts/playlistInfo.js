/**
 * Fetches artist information from LastFM API.
 *
 * @param {string} artistName - The name of the artist.
 * @return {undefined} This function does not return a value.
 */

function fetchArtistInfoFromLastFM(artistName) {
  const apiKey = "api_key";
  const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(
    artistName,
  )}&api_key=${apiKey}&format=json`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const artistName = data.artist.name;
      const artistBio = data.artist.bio.summary;
      const cleanedArtistBio = artistBio.replace(/<a.*?>(.*?)<\/a>/g, "$1");

      displayInfoEL.innerHTML = "";
      getTopTracks(artistName);
      modalInfo(artistName, cleanedArtistBio);
      getSimilarArtist(artistName);
    })
    .catch((err) => console.log(err));
}

const displayInfoEL = document.createElement("div");
displayInfoEL.id = "displayInfo";

document.querySelector(".showModal").appendChild(displayInfoEL);

/**
 * Retrieves the top tracks for a given artist.
 *
 * @param {string} artist - The name of the artist.
 * @return {undefined} This function does not return a value.
 */
function getTopTracks(artist) {
  const params = new URLSearchParams({
    method: "artist.getTopTracks",
    api_key: "api_key",
    artist: artist,
    format: "json",
  });

  const apiUrl = `https://ws.audioscrobbler.com/2.0/?${params}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const topTracks = data.toptracks.track;

      const topTracksList = document.createElement("ul");
      displayInfoEL.appendChild(topTracksList);

      const topTracksTitle = document.createElement("h2");
      topTracksTitle.textContent = "Top Tracks";
      topTracksList.appendChild(topTracksTitle);

      topTracks.slice(0, 10).forEach((track) => {
        // Create a list item for each track
        const trackItem = document.createElement("li");

        // Create an anchor element for the track name and set the href to the track URL
        const trackNameLink = document.createElement("a");
        trackNameLink.textContent = track.name;
        trackNameLink.href = track.url;

        // Create a span element for the playcount
        const playcountSpan = document.createElement("span");
        playcountSpan.textContent = ` Playcount: ${parseInt(track.playcount).toLocaleString()}`;

        // Append the track name and playcount to the list item
        trackItem.appendChild(trackNameLink);
        trackItem.appendChild(playcountSpan);

        // Append the list item to the top tracks list
        topTracksList.appendChild(trackItem);
      });

      // Append the top tracks list to the modal
      displayInfoEL.appendChild(topTracksList);
    });
}

/**
 * Retrieves a list of similar artists based on the given artist name.
 *
 * @param {string} artist - The name of the artist.
 * @return {Promise} A Promise that resolves to the list of similar artists.
 */
function getSimilarArtist(artist) {
  const params = new URLSearchParams({
    method: "artist.getSimilar",
    api_key: "api_key",
    artist: artist,
    format: "json",
  });

  const apiUrl = `https://ws.audioscrobbler.com/2.0/?${params}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const similarArtists = data.similarartists.artist;

      const topSimilarArtist = document.createElement("ul");
      displayInfoEL.appendChild(topSimilarArtist);

      const topSimilarTitle = document.createElement("h2");
      topSimilarTitle.textContent = "Similar Artists";
      topSimilarArtist.appendChild(topSimilarTitle);

      similarArtists.slice(0, 10).forEach((similarArtist) => {
        const similarArtistItem = document.createElement("li");

        const similarArtistNameLink = document.createElement("a");
        similarArtistNameLink.textContent = similarArtist.name;
        similarArtistNameLink.href = similarArtist.url;

        similarArtistItem.appendChild(similarArtistNameLink);

        topSimilarArtist.appendChild(similarArtistItem);
      });
      // append to DOM element with id="similar-artists" in index.html file
      displayInfoEL.appendChild(topSimilarArtist);
    });
}

function removeElement() {
  displayInfoEL.innerHTML = "";
}
function modalInfo(artist, bio) {
  const titleEL = document.createElement("h1");
  titleEL.textContent = artist;

  const artBio = document.createElement("p");
  artBio.textContent = bio;

  displayInfoEL.appendChild(titleEL);
  displayInfoEL.appendChild(artBio);
}

// Usage example
//const artistName = "linkin park";
//fetchArtistInfoFromLastFM(artistName);

//initalize foundation css
Foundation.addToJquery($);
$(document).foundation();
