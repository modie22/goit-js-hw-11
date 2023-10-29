import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '40318616-50572e066ecb7eb09fd108be6';
const searchParams = new URLSearchParams({
  key: API_KEY,
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
});

async function fetchApi(value, page) {
  const resp = await axios.get(
    `${BASE_URL}?${searchParams}&q=${value}&per_page=40&page=${page}`
  );
  return resp.data;
}

const elements = {
  formEl: document.querySelector('.search-form'),
  galleryEl: document.querySelector('.gallery'),
  onloadBox: document.querySelector('.js-rem'),
  target: '',
};
elements.formEl.addEventListener('submit', createCard);
function createCard(e) {
  e.preventDefault();
  elements.galleryEl.innerHTML = '';
  nameS = e.currentTarget.searchQuery.value;
  console.log(nameS);
  elements.onloadBox.classList.add('js-guard');
  elements.target = document.querySelector('.js-guard');
  page = 0;
  observer.observe(elements.target);
}

const gallery = new SimpleLightbox('div.gallery a', {
  captionsData: 'alt',
});

let page = 0;
let nameS = '';
let options = {
  root: null,
  rootMargin: '600px',
  threshold: 1.0,
};
const callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page = page + 1;
      fetchCreate(nameS, page);
    }
  });
};
let observer = new IntersectionObserver(callback, options);

function fetchCreate() {
  fetchApi(nameS, page)
    .then(({ hits, totalHits }) => {
      if (totalHits / (page * 40) < 1) {
        observer.unobserve(elements.target);
      }
      if (hits[0] === undefined) {
        Notiflix.Report.failure(
          'Немає карток з таким іменем',
          'Спробуйте ввести щось інше'
        );
        throw new Error('Немає карток з таким іменем');
      }
      const dataCards = hits
        .map(
          ({
            webformatURL,
            largeImageURL,
            tags,
            likes,
            views,
            comments,
            downloads,
          }) => {
            return `<div class="photo-card">
     <a class="gallery__link" href="${largeImageURL}">
     <img src="${webformatURL}" width="350"  height="250" alt="${tags}" loading="lazy" />
     </a>
     <div class="info">
       <p class="info-item">
         <b>Likes</b><br>
         ${likes}
       </p>
       <p class="info-item">
         <b>Views</b><br>
         ${views}
       </p>
       <p class="info-item">
         <b>Comments</b><br>
         ${comments}
       </p>
       <p class="info-item">
         <b>Downloads</b><br>
         ${downloads}
       </p>
     </div>
   </div>`;
          }
        )
        .join('');
      elements.galleryEl.insertAdjacentHTML('beforeend', dataCards);
      galleryRef();
      console.log(page);
      if (page === 1) {
        Notiflix.Notify.success(
          `✅Запит пройшов успішно! Знайдено ${totalHits} картинок`
        );
      } else if (!(totalHits / (page * 40) < 1)) {
        Notiflix.Notify.success(`✅Завантажено картинки`);
      }
      else{
        Notiflix.Notify.success(
          `Остання сторінка картинок`
        );
      }
    })
    .catch(error => {
      console.log(error);
      Notiflix.Report.failure(`Error: ${error.response.status}`, error.message);
    });
}

function galleryRef() {
  gallery.refresh();
}
