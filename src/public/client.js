const store = {
  user: { name: 'Student' },
  apod: '',
  rovers: [],
};

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (newState) => {
  appStore = Object.assign(store, newState);
  render(root, appStore);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
const App = (state) => {
  const { rovers, apod, user } = state;

  return `
    <header></header>
    <main>
      <section class="container mb-4">
        ${Greeting(user.name)}
      </section>

      ${
        rovers
          ? `
        <section class="container">
          <div class="row">
            ${Object.keys(rovers)
              .map((rover) => RoverComponent(rovers[rover]))
              .join('')}
          </div>
        </section>
        `
          : ``
      }
      
      <section class="container mt-5">
        <p>
          One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
          the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
          This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
          applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
          explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
          but generally help with discoverability of relevant imagery.
        </p>
        ${ImageOfTheDay(state)}
      </section>
    </main>
    <footer></footer>
  `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
  render(root, store);

  getRovers();
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
  if (name) {
    return `<h1 class="border-bottom">Welcome, ${name}!</h1>`;
  }

  return `<h1 class="border-bottom">Hello!</h1>`;
};

const RoverComponent = (rover) => {
  const photos = rover.photos && rover.photos.length > 0 ? rover.photos : [];

  return `
    <section class="col-6 col-md-4 col-lg-3">
      <div class="card">


        ${
          photos?.length
            ? `
            <div id="carousel${
              rover.name
            }Controls" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
              <div class="carousel-item active">
                <img src="${photos[0].img_src}" class="d-block w-100" alt="${
                photos[0].earth_date
              }">
              </div>
              ${
                photos.length > 1
                  ? `<div class="carousel-item">
                <img src="${photos[1].img_src}" class="d-block w-100" alt="${photos[1]?.earth_date}">
              </div>`
                  : ``
              }
              ${
                photos.length > 2
                  ? `<div class="carousel-item">
                <img src="${photos[2].img_src}" class="d-block w-100" alt="${photos[2].earth_date}">
              </div>`
                  : ``
              }
            </div>
            
            ${
              photos.length > 1
                ? `<button class="carousel-control-prev" type="button" data-bs-target="#carousel${rover.name}Controls" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carousel${rover.name}Controls" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Next</span>
            </button>`
                : ``
            }
          </div>            
            `
            : ''
        }
        <div class="card-body">
          <h5 class="card-title">Rover ${rover.name}!</h5>
          <ul class="list-group list-group-flush">
            <li class="list-group-item"><b>Launch Date:</b> ${
              rover.launch_date
            }</li>
            <li class="list-group-item"><b>Landing Date:</b> ${
              rover.landing_date
            }</li>
            <li class="list-group-item"><b>Status:</b> ${rover.status}</li>
            ${
              photos?.length
                ? `<li class="list-group-item"><b>Date the most recent photos were taken:</b> ${photos[0].earth_date}</li>`
                : ``
            }
          </ul>
        </div>
      </div>
    </section>
  `;
};

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (state) => {
  const { apod } = state;

  // If image does not already exist, or it is not from today -- request it again
  const today = new Date();
  const photodate = new Date(apod.date);

  if (!apod || apod.date === today.getDate()) {
    getImageOfTheDay(state);
  }

  // check if the photo of the day is actually type video!
  if (apod.media_type === 'video') {
    return `
      <p>See today's featured video <a href="${apod.url}">here</a></p>
      <p>${apod.title}</p>
      <p>${apod.explanation}</p>
    `;
  } else {
    return apod.image
      ? `
      <img src="${apod.image.url}" width="100%" />
      <p>${apod.image.explanation}</p>
    `
      : `Loading...`;
  }
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
  fetch(`http://localhost:3000/apod`)
    .then((res) => res.json())
    .then((apod) => {
      updateStore({ ...state, apod });
    });
};

const getRovers = () => {
  fetch(`http://localhost:3000/rovers`)
    .then((res) => res.json())
    .then((data) => {
      const { rovers } = data;
      // updateStore({ rovers });

      rovers.map((rover) => {
        fetch(
          `http://localhost:3000/rover/${rover.name}?max_date=${rover.max_date}`
        )
          .then((res) => res.json())
          .then((photo_manifest) => {
            const state = { ...store };

            updateStore({
              ...store,
              rovers: Immutable.set({ ...state.rovers }, rover.name, {
                ...rover,
                photos: photo_manifest.photos,
              }),
            });
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
