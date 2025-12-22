const apiKey = '3dcb628606a4aa5e5f3cb2e9d21fee6f';
const logo = document.getElementById('logo');
const searchForm = document.getElementById('search-form');
const searchPlaceholder = document.getElementById('search-placeholder');
const searchResultList = document.getElementById('search-result');
const container = document.getElementById('container');
let searchResult = []


logo.addEventListener('click', () => {
    container.innerHTML = ''
    searchPlaceholder.value = ''
    searchResultList.innerHTML = ''
})

function createSearchList(movies) {
    searchResultList.innerHTML = ''
    movies.forEach((movie) => {
        const li = document.createElement('li')
        li.classList.add('px-4', 'py-2', 'cursor-pointer', 'hover:bg-pink-300')
        li.innerHTML = movie.name
        searchResultList.appendChild(li)
    })
}

searchPlaceholder.addEventListener('input', async (event) => {
    const value = event.target.value.toLowerCase();
    if (searchResult.length === 0) {
        searchResult = await getMovie(value)
    }

    filterdResult = searchResult.filter((movie) => movie.name.toLowerCase().includes(value))
    createSearchList(filterdResult)

    const movies = filterdResult
    .map(movie => createPoster(movie))
    .join('')
    container.innerHTML = generateContainer(movies)
})

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    let movieName = searchPlaceholder.value;

    const movieData = await getMovie(movieName);
    if (movieData === null) {
        const notFoundHTML = `<div class="w-auto text-center text-pink-700 font-bold text-5xl mx-auto mt-[80px]">Sorry, there is no such movie :(</div>`
        container.innerHTML = notFoundHTML
    } else {
        searchPlaceholder.value = ''
        searchResultList.innerHTML = '' 
        const poster = movieData
            .map(movie => createPoster(movie))
            .join('')
        const containerInner = generateContainer(poster);
        container.innerHTML = containerInner
    }
})

async function getMovie(movieName) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?&include_adult=false&language=en-US&page=1&query=${movieName}&api_key=${apiKey}`)
        const result = await response.json()

        const movieInfo = result.results.map(movie => ({
            name: movie.title,
            overview: movie.overview,
            rating: movie.vote_average
                ? `${Math.round(movie.vote_average)}/10`
                : 'No reviews yet',
            year: movie.release_date.split("-"),
            image: movie.poster_path
                ? movie.poster_path
                : null,
        }))

        if (movieInfo.length === 0) {
            throw new Error('Movie not found')
        } else {
            return movieInfo;
        }

    } catch (error) {
        console.log(error.message);
        return null
    }
}

function createPoster({ name, overview, rating, year, image }) {
    const poster = `
            <div
                class="hover:cursor-pointer bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transform transition duration-300">
                <img src="https://image.tmdb.org/t/p/w500${image}" alt="Movie Poster" class="w-full h-100 object-cover">
                <div class="p-4">
                    <h3 class="font-bold text-lg mb-2 text-pink-800">${name}</h3>
                    <span class="block mb-[5px] font-medium text-pink-900">Rating: ${rating} | ${year[0]}</span>
                    <p class="text-gray-600 text-sm" >${overview}</p>
                </div>
                </div>`
    return poster;
}

function generateContainer(poster) {
    const container = `
        <section class="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="result-container">
        ${poster}
    </section>`
    return container
}