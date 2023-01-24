const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')

const MOVIES_PER_PAGE = 12

const paginator = document.querySelector('#paginator')

function renderMovieList(data) {
  let rawHTML = ``
  for (let item of data) {
    rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img 
                src= ${POSTER_URL + item.image}
                class="card-img-top" 
                alt="Movie Poster"
              >
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <a 
                  href="#" 
                  class="btn btn-primary btn-show-movie" data-bs-toggle="modal" 
                  data-bs-target="#movie-modal"
                  data-id=${item.id}
                >
                  More
                </a>
                <a 
                  href="#" 
                  class="btn btn-danger btn-remove-favorite"
                  data-id=${item.id}
                >
                  X
                </a>
              </div>
            </div>
          </div>
        </div>`
  }
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      modalTitle.innerHTML = response.data.results.title
      modalImage.innerHTML =
        `<img src="${POSTER_URL + response.data.results.image}"
        alt="movie-poster" 
        class="img-fluid">`
      modalDate.innerHTML = 'Release date: ' + response.data.results.release_date
      modalDescription.innerHTML = response.data.results.description
    })
    .catch((err) => console.log(err))
}

function removeFromFavorite(id) {
  if (!movies || !movies.length) return 

  const index = movies.findIndex((movie) => movie.id === id)
  if (index === -1) return
  movies.splice(index, 1)

  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  
  renderMovieList(movies)
}

function getMoviesByPage(page) {
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return movies.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ``
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item">
                  <a class="page-link" href="#" data-page="${page}">${page}</a>
                </li>`
  }
  paginator.innerHTML = rawHTML
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderPaginator(movies.length)
renderMovieList(getMoviesByPage(1))

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.classList.contains(!".page-link")) return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})