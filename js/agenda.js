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
        info.el.firstChild.setAttribute("data-agendas", info.event.extendedProps.agendas.map((agenda) => agenda.id).join(','));
      } else {
        info.el.style.backgroundColor = info.event.extendedProps.color;
        info.el.setAttribute("data-agendas", info.event.extendedProps.agendas.map((agenda) => agenda.id).join(','));
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
        start: "2020-04-16T10:40:00",
        end: "2020-04-16T11:20:00",
        editable: true,
        extendedProps: {
          agendas: [{
            id: "aula-01",
            label: "Lengua 6A"
          }],
          author: "El Profesor",
          color: "var(--mdc-theme-custom__02)"
        },
      },
      {
        id: "2",
        title: "Entrega TP",
        start: "2020-04-13T10:30:00",
        end: "2020-04-13T11:30:00",
        allDay: true,
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
        title: "Visita al museo",
        start: "2020-04-14T08:30:00",
        end: "2020-04-14T11:30:00",
        extendedProps: {
          agendas: [{
            id: "aula-02",
            label: "Ciencias Naturales 3A" 
          }],
          author: "El Rector",
          color: "var(--mdc-theme-custom__08)"
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
          color: "var(--mdc-theme-primary)"
        },
      },
      {
        id: "6",
        title: "Evento institucional",
        start: "2020-04-24T10:30:00",
        end: "2020-04-24T12:30:00",
        extendedProps: {
          agendas: [{
            id: "institucional",
            label: "Institucional" 
          }],
          author: "El Rector",
          color: "var(--mdc-theme-primary)"
        },
      }
    ]
  });

  window.calendar = calendar;
  calendar.render();

  let urlSearchParams = new URLSearchParams(window.location.search);
  if (urlSearchParams.has('fecha')) {
    let date = moment(urlSearchParams.get('fecha'))._d;
    calendar.gotoDate(date);
  }

  updateTitle();

  document.getElementById("calendar-view-toggle").mdc.listen('MDCSelect:change', function(e) {
    if (e.detail.value === 'semana') {
      calendar.changeView("timeGridWeek");
    } else {
      calendar.changeView("dayGridMonth");
    }
    updateTitle();
  });
  $(document.querySelectorAll('.mdc-multiselection-list')).on('MultiSelectionList:change', function(e) {
    let selectedIds = this.component.selectedItems().map((item) => item.id);
    console.log(selectedIds);
    $(calendar.el).find('.fc-event').each(function(i, event) {
      let agendas = $(event).attr('data-agendas').split(',');
      let show = false;
      agendas.forEach(function(agenda) {
        show = show || selectedIds.indexOf(agenda) > -1;
      })
      $(event).toggle(show);
    });
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

    let agendas = (form.agendas === 'institucional')
                  ? [{ id: 'institucional', label: 'Institucional' }]
                  : form.aulas.split(',').map(function(aula) { return { id: aula, label: aula } });

    let event = {
      // obtener desde el backend un id y los datos de las aulas
      id: "5",
      title: form.titulo,
      start: `${ form.fecha }T${ form['horario-desde'] }`,
      end: `${ form.fecha }T${ form['horario-hasta'] }`,
      allDay: form.horario === 'todo-el-dia',
      extendedProps: {
        agendas: agendas,
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
  let eventDialog = $('.mdc-dialog#ver-evento');
  eventDialog.toggleClass('automatic-event', event.extendedProps.agendas[0].id === "aula-virtual");
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
  var chip;
  if (agenda.id === 'institucional' || agenda.id === 'aula-virtual') {
    chip = document.createElement("div");
  } else {
    chip = document.createElement('a');
    chip.setAttribute('href', `${ agenda.id }.html`);
  }

  chip.setAttribute('class', 'mdc-chip');
  chip.setAttribute('id', agenda.id);
  chip.setAttribute('role', 'row');

  var chipTextWrapper = document.createElement('span');
  chipTextWrapper.setAttribute('role', 'gridcell');

  var chipText = document.createElement('span');
  chipTextWrapper.setAttribute('tabindex', '-1');
  chipTextWrapper.classList.add('mdc-chip__text');
  chipTextWrapper.classList.add('mdc-typography--body2');
  chipTextWrapper.textContent = agenda.label;

  chipTextWrapper.appendChild(chipText);
  chip.appendChild(chipTextWrapper);

  return $(chip);
}
