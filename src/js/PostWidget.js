import uniqid from 'uniqid';
import formatDate from './formatDate';

export default class PostWidget {
  constructor(options) {
    this.id = uniqid();
    this.date = new Date();
    this.coordinates = options.coordinates;
    this.text = options.text;
    this.audio = options.audio;
    this.video = options.video;

    this.container = null;
    this.element = null;
    this.showMapClickEventListeners = [];
    this.init();
  }

  init() {
    // Set DOM elements
    this.element = document.createElement('div');
    this.element.classList.add('post');
    this.element.setAttribute('data-id', this.id);

    const dotEl = document.createElement('div');
    dotEl.classList.add('dot');
    this.element.append(dotEl);

    this.messageEl = document.createElement('div');
    this.messageEl.classList.add('post-message');
    this.element.append(this.messageEl);

    this.contentEl = document.createElement('div');
    this.contentEl.classList.add('post-content');
    this.messageEl.append(this.contentEl);

    this.timeEl = document.createElement('div');
    this.timeEl.classList.add('post-time');
    this.messageEl.append(this.timeEl);

    this.gpsEl = document.createElement('div');
    this.gpsEl.classList.add('post-gps');
    this.messageEl.append(this.gpsEl);

    this.coordsEl = document.createElement('span');
    this.coordsEl.classList.add('post-coordinates');
    this.gpsEl.append(this.coordsEl);

    this.mapBtn = document.createElement('span');
    this.mapBtn.classList.add('map-btn');
    this.mapBtn.title = 'Open map';
    this.gpsEl.append(this.mapBtn);

    const eye = document.createElement('i');
    eye.classList.add('fas', 'fa-eye');
    this.mapBtn.append(eye);

    // Set content
    if (this.text && this.text !== '') {
      const textEl = document.createElement('div');
      textEl.classList.add('text-content');
      textEl.textContent = this.text;
      this.contentEl.append(textEl);
    }
    if (this.audio) {
      const audioEl = document.createElement('audio');
      audioEl.classList.add('audio-content');
      audioEl.controls = true;
      audioEl.src = this.audio.src;
      this.contentEl.append(audioEl);
    }
    if (this.video) {
      const videoEl = document.createElement('video');
      videoEl.classList.add('video-content');
      videoEl.controls = true;
      videoEl.src = this.video.src;
      this.contentEl.append(videoEl);
    }

    this.timeEl.textContent = formatDate(this.date);

    if (this.coordinates) {
      this.coordsEl.textContent = `[${this.coordinates.lat}, ${this.coordinates.lon}]`;
      this.mapBtn.setAttribute('data-state', 'available');
    } else {
      this.coordsEl.textContent = '[--.------, --.------]';
      eye.classList.remove('fa-eye');
      eye.classList.add('fa-eye-slash');
      this.mapBtn.title = 'Not available';
    }

    // Add event listeners
    if (this.coordinates) {
      this.mapBtn.addEventListener('click', this.onShowMapClick.bind(this));
    }
  }

  addShowMapClickEventListener(callback) {
    this.showMapClickEventListeners.push(callback);
  }

  onShowMapClick() {
    this.showMapClickEventListeners.forEach((c) => c.call(null, this.id));
  }
}
