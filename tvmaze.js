"use strict";

const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const BASE_URL = "http://api.tvmaze.com/";
const ALTERNATE_IMG_URL = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F2d%2F0e%2Fb6%2F2d0eb6cdb8a4c77c25bb5460084ecffd.png&f=1&nofb=1&ipt=653643550e3764f8fb2fe84b94bfa8e370b2864c0a0e1cbdf10534ba3ce65230&ipo=images";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const params = new URLSearchParams({ q: searchTerm });
  const endpoint = `${BASE_URL}search/shows?${params}`;
  const response = await fetch(endpoint);
  const data = await response.json();

  console.log("getShowsByTerm data=", data);
  const shows = data.map(function (showAndRatingObject) {
    return {
      id: showAndRatingObject.show.id,
      name: showAndRatingObject.show.name,
      summary: showAndRatingObject.show.summary,
      image: showAndRatingObject.show.image ? showAndRatingObject.show.image.medium : ALTERNATE_IMG_URL,
    };
  });

  console.log("getShowsByTerm data = ", shows);
  return shows;
}


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(showId) {
  const endpoint = `${BASE_URL}shows/${showId}/episodes`;
  const response = await fetch(endpoint);
  const data = await response.json();
  //console.log('getEpisodesOfShow data', data);

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    };
  });
  //console.log('getEpisodesOfShow episodes', episodes);
  return episodes;
}

/** Takes an array of episode objects and displays information from them
 * in the DOM.
*/

function displayEpisodes(episodes) {
  $episodesList.empty();
  for (let episode of episodes) {
    const episodeInfo = `${episode.name} (season ${episode.season}, number ${episode.number})`;
    const $episodeElement = $("<li>").text(episodeInfo);
    $episodesList.append($episodeElement);
  }
  $episodesArea.show();
}

/** Search for episodes from TV show and display episodes to the DOM.
 */
async function searchEpisodesAndDisplay(showId) {
  const episodes = await getEpisodesOfShow(showId);
  displayEpisodes(episodes);
}

$showsList.on("click", ".btn", async function handleEpisodesClick(evt) {
  const showId = $(evt.target).closest('.Show').data('show-id');
  await searchEpisodesAndDisplay(showId);
});