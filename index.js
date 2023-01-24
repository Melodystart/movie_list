const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector('#search-input')
const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')
let filteredMovies = []

function renderMovieList (data) {
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
                  class="btn btn-info btn-add-favorite"
                  data-id=${item.id}
                >
                  +
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

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount/MOVIES_PER_PAGE)
  let rawHTML = ``
  for (let page=1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item">
                  <a class="page-link" href="#" data-page="${page}">${page}</a>
                </li>`
  }
  paginator.innerHTML = rawHTML
}

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    //重製分頁器
    renderPaginator(movies.length)
    //預設顯示第 1 頁的搜尋結果
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))

  
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted (event) {
  event.preventDefault()
  const keyWord = searchInput.value.trim().toLowerCase()

  // for (movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyWord)) {
  //     filterdMovies.push(movie)
  //   }
  // }


  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyWord))

  if (filteredMovies.length === 0) {
    return alert(`沒有符合您輸入關鍵字${keyWord}的電影`)
  }
  //重製分頁器
  renderPaginator(filteredMovies.length)
  //預設顯示第 1 頁的搜尋結果
  renderMovieList(getMoviesByPage(1))

})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.classList.contains (!".page-link")) return
  const page = Number(event.target.dataset.page)
  renderMovieList (getMoviesByPage(page))
})