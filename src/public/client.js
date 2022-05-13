const store = Immutable.Map({
  user: { name: 'Student' },
  apod: '',
  rovers: ['Curiosity', 'Opportunity', 'Spirit'],
});

console.log(store.toObject());

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (store, newState) => {
  store = Object.assign(store, newState);
  render(root, store);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
const App = (state) => {
  console.log(state);
  const { rovers, apod, user } = state;

  return `
    <header></header>
    <main>
      <section class="container mb-4">
        ${Greeting(user.name)}
      </section>

      ${
        rovers &&
        `
        <section class="container">
          <div class="row">
            ${rovers.map((rover) => RoverComponent(rover)).join('')}
          </div>
        </section>
        `
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
        ${ImageOfTheDay(apod)}
      </section>
    </main>
    <footer></footer>
  `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
  render(root, store.toObject());
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
  return `
    <section class="col-6 col-md-4 col-lg-3">
      <h3>Rover ${rover}!</h3>
    </section>
  `;
};

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
  // If image does not already exist, or it is not from today -- request it again
  const today = new Date();
  const photodate = new Date(apod.date);

  if (!apod || apod.date === today.getDate()) {
    getImageOfTheDay(store.toObject());
  }

  // check if the photo of the day is actually type video!
  if (apod.media_type === 'video') {
    return `
      <p>See today's featured video <a href="${apod.url}">here</a></p>
      <p>${apod.title}</p>
      <p>${apod.explanation}</p>
    `;
  } else {
    return `
      <img src="${apod.image.url}" width="100%" />
      <p>${apod.image.explanation}</p>
    `;
  }
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
  let { apod } = state;

  fetch(`http://localhost:3000/apod`)
    .then((res) => res.json())
    .then((apod) => updateStore(store.toObject(), { apod }));

  return data;
};
