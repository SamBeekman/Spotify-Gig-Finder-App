const clientId = "07574a44bbef47ad9c5b4949cf020c29";
const redirectUri = "https://alexanderduncan1.github.io/Group1_Project/";
const clientSecret = "3a121714103f4ebbbe8a1d88a0e5fa8c";

// Function to handle user authentication and authorization
let tokenVariable = "";
authenticationCheck(tokenVariable);
displaySavedTickets();
function authenticate() {
  const state = generateRandomString(16);
  localStorage.setItem("spotify_auth_state", state);

  const scope = "playlist-read-private playlist-read-collaborative user-library-read";

  const authorizeUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&state=${state}&scope=${encodeURIComponent(scope)}`;

  // Redirect to Spotify's authorization endpoint
  window.location.href = authorizeUrl;
}

function loadMap() {
  const mapDiv = document.getElementById("map");
  const map = new google.maps.Map(mapDiv, {
    center: { lat: -25.2744, lng: 133.7751 },
    zoom: 4,
  });
}

// Function to handle callback after user authorization
function handleCallback() {
  // Extract the query parameters from the callback URL
  const query = window.location.search.substring(1);
  const params = new URLSearchParams(query);

  // Get authorization code and state
  const code = params.get("code");
  const state = params.get("state");

  // Verify the state and secure
  const storedState = localStorage.getItem("spotify_auth_state");
  if (!state || state !== storedState) {
    return;
  }

  // Clear the stored state
  localStorage.removeItem("spotify_auth_state");

  // POST request to swap the authorization code for an access token
  const tokenUrl = "https://accounts.spotify.com/api/token";
  const data = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  };

  fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(data),
  })
    .then((response) => response.json())
    .then((data) => {
      // Response from the token endpoint
      const accessToken = data.access_token;

      authenticationCheck(accessToken);

      // Use the access token to fetch user's playlists and library
      getUserPlaylists(accessToken);
      getUserLibraryArtists(accessToken);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

//Fetch user's playlists and extract artists from each playlist
function getUserPlaylists(accessToken) {
  fetch("https://api.spotify.com/v1/me/playlists", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const playlists = data.items;
      const allArtists = [];

      // runs over each playlist
      const fetchPromises = playlists.map((playlist) => {
        const playlistId = playlist.id;
        return getPlaylistTracks(accessToken, playlistId)
          .then((tracks) => {
            // Extract artists from each track in the playlist
            const artists = tracks.flatMap((track) =>
              track.track.artists.map((artist) => artist.name),
            );

            allArtists.push(...artists);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      });

      // Wait for all the fetch promises to resolve
      Promise.all(fetchPromises)
        .then(() => {
          // Combine all the arrays and remove duplicates
          const uniqueArtists = [...new Set(allArtists)];

          uniqueSpotifyArtists = uniqueArtists;

          generateArtistList(uniqueArtists);
          loadMap();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// fetch playlist's tracks
function getPlaylistTracks(accessToken, playlistId) {
  return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      //contains the playlist's tracks
      return data.items;
    });
}

//fetch user's library artists
function getUserLibraryArtists(accessToken) {
  fetch("https://api.spotify.com/v1/me/tracks", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const libraryTracks = data.items;
      return libraryTracks.flatMap((track) => track.track.artists.map((artist) => artist.name));
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// saves gibberish to satisfy spotifies securitues Oauth2 stuff and hides the token
function generateRandomString(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// generates the artist list so it can be refrenced and crosschecked later
function generateArtistList(artists) {
  //Creating an unordered list of artists we still supposed to have this?
  const artistList = document.createElement("ul");
  artists.forEach((artist) => {
    const artistItem = document.createElement("li");
    artistItem.textContent = artist;
    artistList.appendChild(artistItem);
  });
}

// Calls the handleCallback function when the page is loaded
window.addEventListener("DOMContentLoaded", handleCallback);

//-------------------------------------------------------------------
//apply to dom function

var redBadge;
var greenBadge;
function authenticationCheck(tokenVariable) {
  if (tokenVariable === null || tokenVariable === "") {
    redBadge = document.createElement("span");
    redBadge.setAttribute("class", "badge alert");
    redBadge.setAttribute("data-tooltip", "");
    redBadge.setAttribute("tabindex", "1");
    redBadge.setAttribute("title", "Not authenticated");
    redBadge.setAttribute("data-position", "bottom");
    redBadge.setAttribute("data-alignment", "right");
    const redIcon = document.createElement("i");
    redIcon.setAttribute("class", "fi-x");
    redBadge.appendChild(redIcon);
    document.querySelector("#badgeIcon").appendChild(redBadge);

    if (greenBadge) {
      greenBadge.remove();
      greenBadge = null;
    }
  } else {
    if (redBadge) {
      redBadge.remove();
      redBadge = null;
    }

    greenBadge = document.createElement("span");
    greenBadge.setAttribute("class", "badge success");
    greenBadge.setAttribute("data-tooltip", "");
    greenBadge.setAttribute("tabindex", "1");
    greenBadge.setAttribute("title", "Authenticated");
    greenBadge.setAttribute("data-position", "bottom");
    greenBadge.setAttribute("data-alignment", "right");
    const greenIcon = document.createElement("i");
    greenIcon.setAttribute("class", "fi-check");
    greenBadge.appendChild(greenIcon);
    document.querySelector("#badgeIcon").appendChild(greenBadge);
  }
}

//don't touch this function.Remain as is
function applyToDom(playlistObj) {
  const playlistEL = document.querySelector(".playlistTab");
  playlistEL.innerHTML = "";

  playlistObj.forEach((artist) => {
    const searchResultEl = document.createElement("div");
    searchResultEl.setAttribute("id", "searchResult");

    const artistTitleEl = document.createElement("div");
    artistTitleEl.setAttribute("id", "playlistTitle");
    searchResultEl.appendChild(artistTitleEl);

    const searchResultTitle = document.createElement("h3");
    searchResultTitle.textContent = artist;
    artistTitleEl.appendChild(searchResultTitle);

    const searchTicketEl = document.createElement("div");
    searchTicketEl.setAttribute("id", "searchTicket");
    searchResultEl.appendChild(searchTicketEl);

    const moreInfoBtn = document.createElement("button");
    moreInfoBtn.setAttribute("class", "button expanded");
    moreInfoBtn.setAttribute("data-open", "infoModal");
    moreInfoBtn.textContent = "More Info";
    moreInfoBtn.addEventListener("click", () => {
      fetchArtistInfoFromLastFM(artist);
    });

    searchTicketEl.appendChild(moreInfoBtn);

    const ticketEL = document.createElement("button");
    ticketEL.setAttribute("class", "success button expanded");
    ticketEL.classList.add("this-button");
    ticketEL.textContent = "View Upcoming Shows";
    ticketEL.addEventListener("click", function (event) {
      // generate tickets
      console.log(event);
      let thisArtist = event.target.parentNode.parentNode.firstChild.textContent;
      specificArtist = thisArtist;
      console.log(thisArtist);
      console.log(this.parentNode);
      event.preventDefault();
      const clearEvents = document.querySelector("#events");
      clearEvents.innerHTML = "";
      getTickets();
    });

    searchTicketEl.appendChild(ticketEL);
    playlistEL.appendChild(searchResultEl);
  });
}

function showNotify(text, color, element) {
  const notifyContainer = document.createElement("div");
  notifyContainer.className = `${color} callout`;
  notifyContainer.innerHTML = `<h5>${text}</h5>`;
  $(`${element}`).prepend(notifyContainer);

  setTimeout(function () {
    notifyContainer.remove();
  }, 3000);
}

// --------------------------------------------------------------------------------------------------------------------------------------
// Discovery API Section

// empty array for initial fetch request data
let uniqueSpotifyArtists = undefined;
let initialDataArrayResults = [];
let uniqueArrayResults = [];
let crossCheckedArray = [];

// function to compare the 2 unique arrays
function findCommonElement(uniqueArrayResults, uniqueSpotifyArtists) {
  // Loop for array 1
  for (let i = 0; i < uniqueArrayResults.length; i++) {
    // Loop for array 2
    for (let j = 0; j < uniqueSpotifyArtists.length; j++) {
      // Compare the element of each and every element from both of the arrays
      if (uniqueArrayResults[i] === uniqueSpotifyArtists[j]) {
        crossCheckedArray.push(uniqueArrayResults[i]);
      }
    }
  }
}

// generate cross checked list results
const generateContent = document.querySelector("#generateList");
generateContent.addEventListener("click", function (event) {
  event.preventDefault();
  showNotify("Generating List...", "success", "#authSection");
  getLocation();
});

// get geolocation
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    var x = document.getElementById("location");
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

// get latitude and longitude
let latlon = "";
let mapLat = "";
let mapLon = "";
function showPosition(position) {
  latlon = position.coords.latitude + "," + position.coords.longitude;
  mapLat = position.coords.latitude;
  mapLon = position.coords.longitude;
  initialArtists();
}

// show errors
function showError(error) {
  var x = document.getElementById("location");
  switch (error.code) {
    case error.PERMISSION_DENIED:
      x.innerHTML = "User denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      x.innerHTML = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      x.innerHTML = "An unknown error occurred.";
      break;
  }
}

// initial fetch to get all tickets for music gigs within a radius of the user location
function initialArtists() {
  var getAllUrl =
    "https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&apikey=eseLXtPfRbVGKGyJSqbCSi9iaudaWTws&latlong=" +
    latlon +
    "&radius=10&size=200";

  fetch(getAllUrl)
    .then((response) => response.json())
    .then((initialData) => {
      console.log("this is initial data", initialData);

      for (const event of initialData._embedded.events) {
        if (event._embedded.hasOwnProperty("attractions")) {
          initialDataArrayResults.push(event._embedded.attractions[0].name);
        }
      }

      uniqueArrayResults = [...new Set(initialDataArrayResults)];
      console.log(uniqueArrayResults);
      findCommonElement(uniqueArrayResults, uniqueSpotifyArtists);

      //remove duplicates from cross-check array
      crossCheckedArray = [...new Set(crossCheckedArray)];

      applyToDom(crossCheckedArray);
    })
    .catch((err) => {
      console.log(err);
    });
}

// discoveryApi fetch for tickets
specificArtist = "";
function getTickets() {
  console.log(crossCheckedArray);
  console.log(specificArtist);
  var url =
    "https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&keyword=" +
    specificArtist +
    "&apikey=eseLXtPfRbVGKGyJSqbCSi9iaudaWTws&latlong=" +
    latlon +
    "&radius=50&size=200";

  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      var e = document.getElementById("events");
      const eventsFoundEl = document.createElement("div");

      if (json.page.totalElements === 0 || !json.page.totalElements) {
        eventsFoundEl.setAttribute("class", "alert callout");
        eventsFoundEl.textContent = json.page.totalElements + " event(s) found";
      } else {
        eventsFoundEl.setAttribute("class", "success callout");
        eventsFoundEl.textContent = json.page.totalElements + " event(s) found";
      }

      e.prepend(eventsFoundEl);

      showEvents(json);
      initMap(mapLat, mapLon, json);
    })
    .catch((err) => {
      console.log(err);
    });
}

// display the events and their details
function showEvents(json) {
  for (var i = 0; i < json.page.totalElements; i++) {
    const eventsEl = document.querySelector("#events");
    const eventContainer = document.createElement("div");
    const eventsNameEL = document.createElement("p");
    const eventsVenueEL = document.createElement("p");
    const eventsDateEL = document.createElement("p");
    // const eventsTimeEL = document.createElement("p");

    for (const newEvent of json._embedded.events) {
      if (newEvent._embedded.hasOwnProperty("attractions")) {
        eventsNameEL.textContent = newEvent._embedded.attractions[0].name;
        //getting the id, name  and url to save to local storage
        const eventsaveURL = newEvent.url;
        const eventSaveName = newEvent.name;
        const eventID = newEvent.id;
        savedLocal(eventID, eventSaveName, eventsaveURL);
        displaySavedTickets();
        //
        eventsVenueEL.textContent = newEvent._embedded.venues[0].name;
      } else {
        console.log(newEvent);
      }
    }
    console.log(json);
    eventsDateEL.textContent = json._embedded.events[i].dates.start.localDate;
    // let localTime = json._embedded.events[i].dates.start.localTime;
    // localTime = toString(localTime);
    // eventsTimeEL.textContent = localTime.slice(0, 4);

    const eventsUrlEL = document.createElement("a");
    eventsUrlEL.setAttribute("href", `${json._embedded.events[i].url}`);
    eventsUrlEL.setAttribute("class", "button expanded");
    eventsUrlEL.textContent = "Buy Tickets";
    // eventContainer.append(eventsNameEL, eventsVenueEL, eventsDateEL, eventsTimeEL);
    eventContainer.append(eventsNameEL, eventsVenueEL, eventsDateEL);
    eventContainer.appendChild(eventsUrlEL);
    eventsEl.appendChild(eventContainer);
  }
}

//--------------------------------------------------------------
function savedLocal(id, name, url) {
  // Retrieve existing saved tickets from local storage
  const savedTicketsString = localStorage.getItem("savedTickets");
  let savedTickets = [];

  // If there are existing saved tickets, parse the JSON string into an array
  if (savedTicketsString) {
    savedTickets = JSON.parse(savedTicketsString);
  }

  const isEventSaved = savedTickets.some((ticket) => ticket.id === id);

  if (!isEventSaved) {
    // Create a new ticket object
    const newTicket = {
      id: id,
      name: name,
      url: url,
    };

    // Add the new ticket to the array
    savedTickets.push(newTicket);

    // Convert the array to a string
    const savedTicketsStringNew = JSON.stringify(savedTickets);

    // Save the updated array in local storage
    localStorage.setItem("savedTickets", savedTicketsStringNew);
  }
}

function displaySavedTickets() {
  // Retrieve saved tickets from local storage
  const savedTicketsString = localStorage.getItem("savedTickets");
  const savedTickets = JSON.parse(savedTicketsString) || [];

  // Get the container element to display the saved tickets
  const savedTicketsContainer = document.querySelector(".savedTickets");

  for (const ticket of savedTickets) {
    //validating
    const existingEventID = document.getElementById(ticket.id);
    if (existingEventID) {
      continue;
    }

    const savedItemEL = document.createElement("div");
    savedItemEL.setAttribute("class", "savedItem");
    savedItemEL.setAttribute("id", ticket.id);
    // Create and append the saved ticket elements
    const savedTicketsTitle = document.createElement("h4");
    savedTicketsTitle.textContent = ticket.name;

    const ticketUrl = document.createElement("a");
    ticketUrl.setAttribute("href", ticket.url);
    ticketUrl.innerHTML = "Ticket Link &#128279;";

    savedItemEL.appendChild(savedTicketsTitle);
    savedItemEL.appendChild(ticketUrl);
    savedTicketsContainer.appendChild(savedItemEL);
  }
}

//-------------------------------------------------------------------------------

function initMap(mapLat, mapLon, json) {
  const mapDiv = document.getElementById("map");
  const map = new google.maps.Map(mapDiv, {
    center: { lat: mapLat, lng: mapLon },
  });

  const bounds = new google.maps.LatLngBounds();

  for (let i = 0; i < json.page.totalElements; i++) {
    const event = json._embedded.events[i];
    const venueLat = event._embedded.venues[0].location.latitude;
    const venueLon = event._embedded.venues[0].location.longitude;
    const venueLatLng = new google.maps.LatLng(venueLat, venueLon);

    google.maps.event.addListener(map, "zoom_changed", function () {
      zoomChangeBoundsListener = google.maps.event.addListener(
        map,
        "bounds_changed",
        function (event) {
          if (this.getZoom() > 15 && this.initialZoom == true) {
            this.setZoom(12);
            this.initialZoom = false;
          }
          google.maps.event.removeListener(zoomChangeBoundsListener);
        },
      );
    });
    map.initialZoom = true;

    bounds.extend(venueLatLng);
    addMarker(map, event);
  }

  map.fitBounds(bounds);
}

function addMarker(map, event) {
  console.log(event);
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(
      event._embedded.venues[0].location.latitude,
      event._embedded.venues[0].location.longitude,
    ),
    map: map,
  });
  marker.setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png");
  console.log(marker);
}

//---------------------------------------------------
//leave this bit always at the bottom
Foundation.addToJquery($);
$(document).foundation();
//---------------------------------------------------
