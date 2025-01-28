'use strict';

class Workout {
  id = (Date.now() + '').slice(-10);
  date = new Date();
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    // prettier-ignore
    const months = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(
      1
    )} în data de ${this.date.getDay()} ${
      months[this.date.getMonth()]
    } ${this.date.getFullYear()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([32, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([32, -12], 27, 95, 523);
// console.log(run1, cycling1);
////////////////////////////////////////////////
// ARHITECTURA APLICATIEI
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const resetBtn = document.querySelector('.form__btn--reset');

class App {
  #map;
  #mapEvent;
  #mapZoomLevel = 14;
  #workouts = [];
  constructor() {
    this._init();
    this._getLocalStorage();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    resetBtn.addEventListener('click', this.reset);
  }

  async _init() {
    try {
      const position = await this._getPosition();
      console.log(position);
      this._loadMap(position);
    } catch (err) {
      this._renderError(err.message);
    }
  }
  _renderError(message) {
    // Clauza de protectie in caz ca exista deja un mesaj in container sa nu se mai afiseze altul.
    let existingError = document.querySelector('.error__message');
    if (existingError) return;

    // Adaugam mesajul de eroare in container
    containerWorkouts.insertAdjacentHTML(
      'beforeend',
      `<div class="error__message">Ceva nu a mers bine: ${message}</div> `
    );

    // Stergem mesajul de eroare dupa 1.5 secunde
    setTimeout(() => {
      const errEl = document.querySelector('.error__message');
      if (errEl) errEl.remove();
    }, 1500);
  }
  _getPosition() {
    // navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
    //   alert(`Coordonatele nu au putut fi preluate`);
    // });
    const defaultCoords = {
      latitude: 44.4268, // Latitudine implicită (ex: București)
      longitude: 26.1025, // Longitudine implicită (ex: București)
    };
    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        // navigator.geolocation.getCurrentPosition(
        //   position => resolve(position),
        //   err => reject(err)
        // );
        navigator.geolocation.getCurrentPosition(
          position => resolve(position),
          err => {
            this._renderError(
              'Permisiunea a fost refuzată sau este o eroare la geolocație'
            );
            resolve({ coords: defaultCoords });
          }
        );
      });
    } else {
      this._renderError(
        'Positia nu a fost gasita si coordonatele au fost setate implicit'
      );
      return Promise.resolve({ coords: defaultCoords });
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    // console.log(
    //   `Coordonatele au fost preluate cu succes - longitudine: ${longitude}, latitudine: ${latitude}`
    // );
    L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(this.#map);
    // Handling clicks on the map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(workout => this._renderWorkoutMarker(workout));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    form.classList.add('hidden');
    form.style.display = 'none';
    setTimeout(() => (form.style.display = 'grid'), 1000);
    // Resetam inputurile
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const isFinite = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const isPositive = (...inputs) => inputs.every(inp => inp > 0);
    e.preventDefault();

    // Preluam datele utilizatorului din formular
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    // Daca este workout de alergare, cream obiectul running

    // Validam aceste date
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !isFinite(distance, duration, cadence) ||
        !isPositive(distance, duration, cadence)
      )
        return this._renderError(`Inputurile trebuie sa fie numere pozitive!`);

      workout = new Running([lat, lng], distance, duration, cadence);
    }
    // Daca este workout de ciclism, cream obiectul cycling
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !isFinite(distance, duration, elevation) ||
        !isPositive(distance, duration)
      )
        return alert('Inputurile trebuie sa fie numere pozitive');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    // Adaugam obiectul in workout array
    this.#workouts.push(workout);
    // console.log(this.#workouts);
    // Afisam workout-ul pe harta cu un marker
    this._renderWorkoutMarker(workout);
    // Afisam antrenamentele(workouts) intr-o lista
    this._renderWorkout(workout);
    // Resetam campurile imputurilor si ascundem formularul
    this._hideForm();
    // Salvam in localStorage toate antrenamentele
    this._setLocalStorage();
  }

  _renderWorkout(workout) {
    // console.log(workout);
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
       <span class="workout__icon">${
         workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
       }</span>
       <span class="workout__value">${workout.distance}</span>
       <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
       <span class="workout__icon">⏱</span>
       <span class="workout__value">${workout.duration}</span>
       <span class="workout__unit">min</span>
      </div>`;

    if (workout.type === 'running') {
      html += `<div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`;
    }

    if (workout.type === 'cycling') {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>`;
    }

    form.insertAdjacentHTML('afterend', html);
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      workout => workout.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animation: 1,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach(workout => this._renderWorkout(workout));
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}
const app = new App();
