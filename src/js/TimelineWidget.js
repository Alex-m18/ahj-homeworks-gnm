/* eslint-disable no-alert */
import PostWidget from './PostWidget';
import CoordinatesForm from './CoordinatesForm';
import { addZero } from './formatDate';

export default class TimelineWidget {
  constructor() {
    this.container = null;
    this.element = null;
    this.posts = [];
    this.coordinatesForm = null;
    this.recordTimerID = null;
    this.recorder = null;
  }

  init() {
    // Base element
    this.element = document.createElement('div');
    this.element.classList.add('timeline-widget');
    this.element.id = 'timeline-widget';
    this.container.append(this.element);

    // Timeline
    this.timelineEl = document.createElement('div');
    this.timelineEl.classList.add('timeline');
    this.element.append(this.timelineEl);

    this.vLineEl = document.createElement('div');
    this.vLineEl.classList.add('vertical-line');
    this.timelineEl.append(this.vLineEl);

    // Input area
    this.inputAreaEl = document.createElement('div');
    this.inputAreaEl.classList.add('input-area');
    this.element.append(this.inputAreaEl);

    this.videoEl = document.createElement('video');
    this.videoEl.classList.add('video-popup', 'hidden');
    this.videoEl.muted = true;
    this.inputAreaEl.append(this.videoEl);

    this.inputEl = document.createElement('input');
    this.inputEl.classList.add('text-input');
    this.inputEl.type = 'text';
    this.inputEl.placeholder = 'Type this something...';
    this.inputAreaEl.append(this.inputEl);

    // Choice buttons
    this.choiceBtnsEl = document.createElement('div');
    this.choiceBtnsEl.classList.add('choice', 'buttons-area');
    this.inputAreaEl.append(this.choiceBtnsEl);

    this.audioRecordBtn = document.createElement('span');
    this.audioRecordBtn.classList.add('audio-rec-btn');
    this.choiceBtnsEl.append(this.audioRecordBtn);
    const audioRecordSymb = document.createElement('i');
    audioRecordSymb.classList.add('fas', 'fa-microphone');
    this.audioRecordBtn.append(audioRecordSymb);

    this.videoRecordBtn = document.createElement('span');
    this.videoRecordBtn.classList.add('video-rec-btn');
    this.choiceBtnsEl.append(this.videoRecordBtn);
    const videoRecordSymb = document.createElement('i');
    videoRecordSymb.classList.add('fas', 'fa-video');
    this.videoRecordBtn.append(videoRecordSymb);

    // Record control buttons
    this.recordBtnsEl = document.createElement('div');
    this.recordBtnsEl.classList.add('record', 'buttons-area', 'hidden');
    this.inputAreaEl.append(this.recordBtnsEl);

    this.stopRecordBtn = document.createElement('span');
    this.stopRecordBtn.classList.add('stop-rec-btn');
    this.recordBtnsEl.append(this.stopRecordBtn);
    const stopRecordSymb = document.createElement('i');
    stopRecordSymb.classList.add('fas', 'fa-stop');
    this.stopRecordBtn.append(stopRecordSymb);

    this.recordTimeEl = document.createElement('span');
    this.recordTimeEl.classList.add('record-time');
    this.recordTimeEl.textContent = '00:00';
    this.recordBtnsEl.append(this.recordTimeEl);

    this.cancelRecordBtn = document.createElement('span');
    this.cancelRecordBtn.classList.add('cancel-rec-btn');
    this.recordBtnsEl.append(this.cancelRecordBtn);
    const cancelRecordSymb = document.createElement('i');
    cancelRecordSymb.classList.add('fas', 'fa-times');
    this.cancelRecordBtn.append(cancelRecordSymb);

    // Form
    this.coordinatesForm = new CoordinatesForm(document.body);
    this.coordinatesForm.init();

    // Add event listeners
    this.inputEl.addEventListener('keyup', this.onInputKeyUp.bind(this));
    this.audioRecordBtn.addEventListener('click', this.onAudioRecordClick.bind(this));
    this.videoRecordBtn.addEventListener('click', this.onVideoRecordClick.bind(this));
    this.stopRecordBtn.addEventListener('click', this.onStopRecord.bind(this));
    this.cancelRecordBtn.addEventListener('click', this.onCancelRecord.bind(this));
  }

  onStartRecord() {
    this.recordCancelled = false;
    this.startTimer();
    this.choiceBtnsEl.classList.add('hidden');
    this.recordBtnsEl.classList.remove('hidden');
  }

  onStartVideoRecord() {
    this.onStartRecord();
    this.videoEl.classList.remove('hidden');
    this.videoEl.srcObject = this.recorder.stream;
    this.videoEl.play();
  }

  onStopRecord() {
    if (this.recorder.state !== 'recording') return;
    this.choiceBtnsEl.classList.remove('hidden');
    this.recordBtnsEl.classList.add('hidden');
    this.videoEl.classList.add('hidden');
    this.stopTimer();
    this.recorder.stop();
    this.recorder.stream.getTracks().forEach((track) => track.stop());
    this.videoEl.srcObject = null;
  }

  onCancelRecord() {
    if (this.recorder.state !== 'recording') return;
    this.recordCancelled = true;
    this.onStopRecord();
  }

  async onVideoRecordClick() {
    try {
      if (!TimelineWidget.mediaIsAvailable) throw new Error();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      this.recorder = new MediaRecorder(stream);
      const chunks = [];

      this.recorder.addEventListener('start', this.onStartVideoRecord.bind(this));
      this.recorder.addEventListener('dataavailable', (evt) => chunks.push(evt.data));
      this.recorder.addEventListener('stop', this.onStopRecord.bind(this));

      this.recorder.addEventListener('stop', () => {
        if (!this.recordCancelled) {
          const blob = new Blob(chunks);
          this.addPost({ video: { src: URL.createObjectURL(blob) } });
        }
      });

      this.recorder.start();
    } catch (e) {
      if (e.message.toLowerCase().includes('denied')) {
        alert('Вы запретили использование камеры');
        return;
      }
      alert(`Ваш браузер не поддерживает данный функционал.
Обновитесь или попробуйте другой современный браузер`);
      // console.log(e);
    }
  }

  async onAudioRecordClick() {
    if (!TimelineWidget.mediaIsAvailable) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      this.recorder = new MediaRecorder(stream);
      const chunks = [];

      this.recorder.addEventListener('start', this.onStartRecord.bind(this));
      this.recorder.addEventListener('dataavailable', (evt) => chunks.push(evt.data));
      this.recorder.addEventListener('stop', this.onStopRecord.bind(this));

      this.recorder.addEventListener('stop', () => {
        if (!this.recordCancelled) {
          const blob = new Blob(chunks);
          this.addPost({ audio: { src: URL.createObjectURL(blob) } });
        }
      });

      this.recorder.start();
    } catch (e) {
      alert('Вы запретили использование микрофона');
    }
  }

  onInputKeyUp(evt) {
    if (this.inputEl.value.trim() !== '' && evt.key === 'Enter') {
      this.addPost({ text: this.inputEl.value.trim() });
      this.inputEl.value = '';
    }
  }

  startTimer() {
    const initTime = new Date();
    this.recordTimeEl.textContent = '00:00';

    this.recordTimerID = setInterval(() => {
      const t = new Date(Date.now() - initTime);
      this.recordTimeEl.textContent = `${addZero(t.getMinutes())}:${addZero(t.getSeconds())}`;
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.recordTimerID);
  }

  post(id) {
    return this.posts.find((o) => o.id === id);
  }

  async addPost(options) {
    const opt = options;
    if (!opt.coordinates) {
      opt.coordinates = await this.getCoordinates();
    }
    if (!opt.text && this.inputEl.value.trim() !== '') {
      opt.text = this.inputEl.value;
    }
    const newPost = new PostWidget(opt);
    this.posts.push(newPost);
    this.vLineEl.after(newPost.element);
    newPost.addShowMapClickEventListener(this.showMap.bind(this));
    this.timelineEl.scrollTop = 0;
    setTimeout(() => {
      this.vLineEl.style.height = `calc(${this.timelineEl.scrollHeight}px - 2rem)`;
    }, 500);
  }

  async getCoordinates() {
    if (!navigator.geolocation) return null;

    const coords = await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude.toFixed(6), lon: longitude.toFixed(6) });
        },
        (/* err */) => {
          // if (err.code === err.PERMISSION_DENIED) {
          //   resolve(null);
          //   return;
          // }
          this.coordinatesForm.show(
            (data) => {
              this.coordinatesForm.hide();
              resolve(data);
            },
            () => {
              this.coordinatesForm.hide();
              resolve(null);
            },
          );
        },
      );
    });
    return coords;
  }

  showMap(id) {
    const post = this.post(id);
    window.open(
      `http://maps.yandex.ru/?text=${post.coordinates.lat},${post.coordinates.lon}`,
      '_blank',
    );
  }

  bindToDOM(container) {
    this.container = container;
  }
}

// eslint-disable-next-line class-methods-use-this
TimelineWidget.mediaIsAvailable = () => {
  if (!navigator.mediaDevices || !window.MediaRecorder) {
    alert(`Ваш браузер не поддерживает данный функционал.
Обновитесь или попробуйте другой современный браузер`);
    return false;
  }
  return true;
};
