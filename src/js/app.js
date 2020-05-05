import TimelineWidget from './TimelineWidget';

const widget = new TimelineWidget();
widget.bindToDOM(document.querySelector('#timeline-widget-container'));
widget.init();

widget.addPost({
  text: 'Мои филосовские цитаты мыслителей иногда оказываются совсем не цитатами',
  coordinates: { lat: 51.50851, lon: -0.12572 },
});

widget.addPost({
  text: 'НЛО прилетело и оставило эту запись здесь',
  coordinates: { lat: 37.238017, lon: -115.807157 },
});
