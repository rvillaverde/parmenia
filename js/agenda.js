document.addEventListener("DOMContentLoaded", function () {
  var calendarEl = document.getElementById("calendar");

  var calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: ["dayGrid", "timeGrid", "moment", "interaction"],
    defaultView: "timeGridWeek",
    locale: "es",
    firstDay: 7,
    header: {
      left: "prev,next",
      center: "title",
      right: "",
    },
    slotLabelFormat: {
      hour: "numeric",
      minute: "2-digit",
    },
    slotDuration: "00:30:00",
    minTime: "06:00:00",
    maxTime: "20:00:00",
    titleFormat: { year: 'numeric', month: 'long' },
    dayRender(dayRenderInfo) {
      // console.log(dayRenderInfo);
    },
    columnHeaderHtml: function (date, b) {
      const day = dayjs(date);
      const dayName = day.format("ddd").slice(0, -1);
      const dayNameHTML = `<span class="fc-header-day-name">${dayName}</span>`;
      if (calendar.view.type == "dayGridMonth") {
        return dayNameHTML;
      } else {
        const dayNumber = day.format("D");

        return (
          dayNameHTML +
          `<span class="fc-header-day-number">${dayNumber}</span>`
        );
      }
    },
    eventRender: function (info) {
      if (calendar.view.type == "dayGridMonth") {
        const dot = document.createElement("span");
        dot.className = "dot";
        dot.style.backgroundColor = info.event.extendedProps.color;
        info.el.firstChild.prepend(dot);
        info.el.firstChild.classList.add("mdc-typography--body2");
        info.el.firstChild.setAttribute("data-agenda", info.event.extendedProps.agenda.id);
      } else {
        info.el.style.backgroundColor = info.event.extendedProps.color;
        info.el.setAttribute("data-agenda", info.event.extendedProps.agendas.map((agenda) => agenda.id).join(','));
        info.el.classList.add("mdc-typography--body2");
        const content = info.el.querySelector(".fc-content");
        const title = info.el.querySelector(".fc-title");
        content.prepend(title);
      }
      // altera el render del evento dentro del cuadro del día
    },
    eventClick(info) {
      viewEvent(info.event);
    },
    events: [
      {
        id: "1",
        title: "Prueba Lengua 5toB",
        start: "2020-04-08T10:30:00",
        end: "2020-04-08T11:30:00",
        editable: true,
        extendedProps: {
          agendas: [{
            id: "aula-01",
            label: "Nombre del aula 1"
          }],
          author: "El Profesor",
          color: "var(--mdc-theme-custom__05)"
        },
      },
      {
        id: "2",
        title: "Entrega TP",
        start: "2020-04-13T10:30:00",
        end: "2020-04-13T11:30:00",
        extendedProps: {
          agendas: [{
            id: "aula-virtual",
            label: "Aula Virtual" 
          }],
          author: "El Profesor",
          color: "var(--mdc-theme-primary__100)"
        },
      },
      {
        id: "3",
        title: "Evento institucional",
        start: "2020-04-11T10:30:00",
        end: "2020-04-11T12:30:00",
        allDay: true,
        extendedProps: {
          agendas: [{
            id: "institucional",
            label: "Institucional" 
          }],
          author: "El Rector",
          color: "var(--mdc-theme-primary)"
        },
      },
      {
        id: "5",
        title: "Evento institucional",
        start: "2020-04-12T10:30:00",
        end: "2020-04-12T12:30:00",
        extendedProps: {
          agendas: [{
            id: "institucional",
            label: "Institucional" 
          }],
          author: "El Rector",
          color: "var(--mdc-theme-secondary)"
        },
      }
    ]
  });

  window.calendar = calendar;
  calendar.render();
  updateTitle();

  document.getElementById("calendar-view-toggle").mdc.listen('MDCSelect:change', function(e) {
    if (e.detail.value === 'semana') {
      calendar.changeView("timeGridWeek");
    } else {
      calendar.changeView("dayGridMonth");
    }
    updateTitle();
  });
  $(document.querySelectorAll('.mdc-multiselection-list > .mdc-list')[0].mdc).change(function(e) {
    console.log('lalalal');
  });
  $("#calendar-preview").on("CalendarPreview:newDate", (e, detail) => {
    calendar.gotoDate(detail.date);
    updateTitle();
  });
  document.getElementById("calendar-prev").addEventListener("click", () => {
    calendar.prev();
    updateTitle();
  });
  document.getElementById("calendar-next").addEventListener("click", () => {
    calendar.next();
    updateTitle();
  });
  document.getElementById("crear-evento__form").onsubmit = function(e) {
    e.preventDefault();
    let form = getFormFields(this);

    let event = {
      // obtener desde el backend un id y los datos de las aulas
      id: "5",
      title: form.titulo,
      start: `${ form.fecha }T${ form['horario-desde'] }`,
      end: `${ form.fecha }T${ form['horario-hasta'] }`,
      allDay: form.horario === 'todo-el-dia',
      extendedProps: {
        agendas: [{
          id: "institucional",
          label: "Institucional" 
        }],
        author: "Mi usuario",
        color: "var(--mdc-theme-secondary)"
      }
    };

    calendar.addEvent(event);
    closeDialog();
  }
});

function updateTitle() {
  $('#calendar-title').text($(calendar.el).find('.fc-center h2').text().replace('de ', '').trim());
}

function viewEvent(event) {
  console.log(event);
  let eventDialog = $('.mdc-dialog#ver-evento');
  eventDialog.toggleClass('editable-event', event.editable);
  eventDialog.find('.mdc-dialog__title').text(event.title);
  eventDialog.find('.event-date-time span:first-child').text(formatDate(event.start));
  if (event.allDay) {
    eventDialog.find('.event-date-time span:last-child').text('Todo el día');
  } else {
    eventDialog.find('.event-date-time span:last-child').text(`${ formatTime(event.start) } — ${ formatTime(event.end) }`);
  }
  eventDialog.find('.mdc-chip-set').empty();
  event.extendedProps.agendas.forEach(function(agenda) {
    eventDialog.find('.mdc-chip-set').append(createChip(agenda));
  });

  eventDialog.find('.event-agenda__wrapper .round-photo-wrapper').css('background-color', event.extendedProps.color);
  eventDialog.find('.agenda-label').text(event.extendedProps.agendas.map((agenda) => agenda.label).join(', '));
  eventDialog.find('.event-info .author-name').text(event.extendedProps.author);
  openDialog('ver-evento');
}

function createChip(agenda) {
  console.log('createChip');
  let chipStr = `<div class="mdc-chip" role="row" id="%id%">
                  <span role="gridcell">
                    <span tabindex="-1" class="mdc-chip__text mdc-typography--body2">%label%</span>
                  </span>
                </div>`

  let chipEl = chipStr.split('%id%').join(agenda.id).split('%label%').join(agenda.label);
  return $(chipEl);
}
