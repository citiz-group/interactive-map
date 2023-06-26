/*  INITIALIZATIONS
 */

const MAP = L.map('map', {
  center: [46.227638, 2.213749],
  maxBoundsViscosity: 1,
  minZoom: 6,
  zoom: 6
});

const MINI_MAP = new L.Control.MiniMap(new L.TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://immocitiz.fr/" target="_blank">Immocitiz</a>',
  maxZoom: 99
}), {
  toggleDisplay: true,
  zoomAnimation: true
}).addTo(MAP);

const TILES_LAYER = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://immocitiz.fr/" target="_blank">Immocitiz</a>',
  maxZoom: 99
}).addTo(MAP);

const REGION_MARKERS = L.layerGroup();
const ADDRESS_MARKERS = L.layerGroup();

const REGION_MARKER_LIST = [];
const ADDRESS_MARKER_LIST = [];
const ADDRESS_LIST = [];

let carouselIndex = 1;

// MAP.locate();
MAP.setMaxBounds(MAP.getBounds());

/*  MAIN
 */

fetch('https://fetch-y2o3vi2tyq-ew.a.run.app?name=activeProducts')
  .then(response => response.json())
  .then(response => {
    let regionCount = {};

    response.data.forEach(product => {
      if (regionCount[product['ff889249fdf2a050f358d1123539ce8f310fcf87_admin_area_level_1']] === undefined) {
        regionCount[product['ff889249fdf2a050f358d1123539ce8f310fcf87_admin_area_level_1']] = 0;
      }
      regionCount[product['ff889249fdf2a050f358d1123539ce8f310fcf87_admin_area_level_1']]++;

      loadAddress(product);
    });

    Object.entries(regionCount).forEach(region => {
      fetch('https://fetch-y2o3vi2tyq-ew.a.run.app?name=geocode&address=' + encodeURI(region[0]))
        .then(response => response.json())
        .then(response => {
          let collection = '<a href="https://immocitiz.store/collections/';

          switch (region[0]) {
            case 'Auvergne-Rhône-Alpes':
            case 'Bourgogne-Franche-Comté':
            case 'Grand Est':
              collection += 'grand-est';
              break;
            case 'Bretagne':
            case 'Centre-Val de Loire':
            case 'Normandie':
            case 'Nouvelle-Aquitaine':
            case 'Pays de la Loire':
              collection += 'grand-ouest';
              break;
            case 'Hauts-de-France':
              collection += 'hauts-de-france';
              break;
            case 'Occitanie':
            case 'Provence-Alpes-Côte d\'Azur':
              collection += 'sud';
              break;
            case 'Île-de-France':
              collection += 'ile-de-france';
              break;
            default:
              collection += 'all';
              break;
          }

          collection += '" target="_blank">En savoir plus</a>';

          const MARKER =
            L.marker([response.results[0].geometry.location.lat, response.results[0].geometry.location.lng], {
              icon: L.icon({
                iconAnchor: [12.5, 41],
                iconUrl: 'marker-icons/marker-icon-red.png',
                popupAnchor: [1, -41],
                shadowUrl: 'marker-icons/marker-shadow.png'
              }),
              title: region[0]
            }).addTo(REGION_MARKERS)
              .bindPopup(
                '<div class="fw-bold" ' +
                     'style="border-bottom: rgba(0, 0, 0, .1) solid 1px; margin-bottom: 10px; padding-bottom: 10px;">' + region[0] + '</div>' +
                '<div class="align-items-center d-flex" ' +
                     'style="border-bottom: rgba(0, 0, 0, .1) solid 1px; margin-bottom: 10px; padding-bottom: 10px;">' +
                  '<svg class="bi bi-shop" ' +
                       'fill="rgba(0, 0, 0, 1)" ' +
                       'height="48" ' +
                       'viewBox="0 0 16 16" ' +
                       'width="48" ' +
                       'xmlns="http://www.w3.org/2000/svg">' +
                    '<path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z"/>' +
                  '</svg>' +
                  '<span style="margin-left: 20px;">' +
                    '<b>' + region[1] + '</b> opportunité(s)<br>' +
                    '<button class="btn btn-primary" ' +
                            'onclick="loadMarkers(ADDRESS_MARKERS, \'address\');" ' +
                            'type="button">Afficher</button>' +
                  '</span>' +
                '</div>' +
                collection
              )
              .on('click', marker => setView(marker));

          REGION_MARKER_LIST.push(MARKER);
        });
    });

    loadMarkers(REGION_MARKERS, 'region');
    loadList();
  });

/*  EVENT LISTENERS
 */

/*  Event listener that triggers when a user shares their location and executes a function
 *  to calculate and print the distance and travel time between the user's location and a set list of addresses.
 *  The user's location is passed as a parameter to the function.
 */
MAP.on('locationfound', location => setTravelInformations(location));

/*  FUNCTIONS
 */

/*  Generates an HTML string of an image carousel based on a given product object and index.
 *    @param {object} product - The product object containing information about the images.
 *    @param {number} i - The index representing the current carousel.
 *    @returns {string} - The HTML string representing the image carousel.
 */
const getCarousel = (product, i) => {
  return '' +
    '<div class="carousel rounded-4 slide" id="carousel' + i + '">' +
      '<div class="carousel-indicators">' +
        '<button aria-current="true" aria-label="Slide 1" class="active" data-bs-slide-to="0" data-bs-target="#carousel' + i + '" type="button"></button>' +
        '<button aria-label="Slide 2" data-bs-slide-to="1" data-bs-target="#carousel' + i + '" type="button"></button>' +
        '<button aria-label="Slide 3" data-bs-slide-to="2" data-bs-target="#carousel' + i + '" type="button"></button>' +
        '<button aria-label="Slide 4" data-bs-slide-to="3" data-bs-target="#carousel' + i + '" type="button"></button>' +
        '<button aria-label="Slide 5" data-bs-slide-to="4" data-bs-target="#carousel' + i + '" type="button"></button>' +
        '<button aria-label="Slide 6" data-bs-slide-to="5" data-bs-target="#carousel' + i + '" type="button"></button>' +
      '</div>' +
      '<div class="carousel-inner h-100 rounded-4">' +
        '<div class="active carousel-item h-100 rounded-4">' +
          '<img class="d-block h-100 w-100" src="' + product['9bfb960a08f96d955136571b244c555d007cf46b'] + '?profile=visuel1">' +
        '</div>' +
        '<div class="carousel-item h-100">' +
          '<img class="d-block h-100 w-100" src="' + product['7ffff78b28d3373fb4fca0d8b9a3b7a3c068587b'] + '?profile=visuel1">' +
        '</div>' +
        '<div class="carousel-item h-100">' +
          '<img class="d-block h-100 w-100" src="' + product['a724765a4be4748b733c1d1b3ff3776619100eb9'] + '?profile=visuel1">' +
        '</div>' +
        '<div class="carousel-item h-100">' +
          '<img class="d-block h-100 w-100" src="' + product['ac1b837baad62b4f520901ce5d61ac3d9bc5f583'] + '?profile=visuel1">' +
        '</div>' +
        '<div class="carousel-item h-100">' +
          '<img class="d-block h-100 w-100" src="' + product['4af197f76ca4d64a5c87a08244f483d5af6708b9'] + '?profile=visuel1">' +
        '</div>' +
        '<div class="carousel-item h-100">' +
          '<img class="d-block h-100 w-100" src="' + product['8d2b9a917d094f7a62681cc8cfa18f1bff1eef52'] + '?profile=visuel1">' +
        '</div>' +
      '</div>' +
      '<button class="carousel-control-prev" data-bs-slide="prev" data-bs-target="#carousel' + i + '" type="button">' +
        '<span aria-hidden="true" class="carousel-control-prev-icon"></span>' +
        '<span class="visually-hidden">Previous</span>' +
      '</button>' +
      '<button class="carousel-control-next" data-bs-slide="next" data-bs-target="#carousel' + i + '" type="button">' +
        '<span aria-hidden="true" class="carousel-control-next-icon"></span>' +
        '<span class="visually-hidden">Next</span>' +
      '</button>' +
    '</div>';
}

/*  Creates a marker, its popup, and its card based on the provided product object,
 *  adds them to their respective sets of markers, popups, and cards, and loads the updated list.
 *    @param {object} product - The product object containing information about the marker, popup, and card.
 */
const loadAddress = product => {
  const ADDRESS =
    product['ff889249fdf2a050f358d1123539ce8f310fcf87_route'] +
    ' ' +
    product['ff889249fdf2a050f358d1123539ce8f310fcf87_locality'].toUpperCase() +
    ' (' +
    product['ff889249fdf2a050f358d1123539ce8f310fcf87_postal_code'] +
    ')';
  const PROFITABILITY = product['a2d1486abfd1f662fb387a34b0c590f4fd517ab8'].toFixed(2);
  const STORE = product['3a76ea85df1fa8b1d1885af9a1c72c9699b7dca4'];
  const TOTAL_INVESTMENT = product['6a494ae5c460f7cb49a521620bc0359fb3018c5f'].toFixed();

  fetch('https://fetch-y2o3vi2tyq-ew.a.run.app?name=geocode&address=' + encodeURI(ADDRESS))
    .then(response => response.json())
    .then(response => {
      const MARKER = L.marker([response.results[0].geometry.location.lat, response.results[0].geometry.location.lng], {
          icon: L.icon({
            iconAnchor: [12.5, 41],
            iconUrl: 'marker-icons/marker-icon.png',
            popupAnchor: [1, -41],
            shadowUrl: 'marker-icons/marker-shadow.png'
          }),
          title: ADDRESS
      }).addTo(ADDRESS_MARKERS)
        .bindPopup(
          '<div class="align-items-center d-flex" ' +
               'style="border-bottom: rgba(0, 0, 0, .1) solid 1px; padding: 6.5px 0 13px 0;">' +
            '<div style="margin-right: 10px;">' +
              '<svg class="bi bi-geo" ' +
                   'fill="rgba(0, 0, 0, 1)" ' +
                   'height="24" ' +
                   'viewBox="0 0 16 16" ' +
                   'width="24" ' +
                   'xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999zm2.493 8.574a.5.5 0 0 1-.411.575c-.712.118-1.28.295-1.655.493a1.319 1.319 0 0 0-.37.265.301.301 0 0 0-.057.09V14l.002.008a.147.147 0 0 0 .016.033.617.617 0 0 0 .145.15c.165.13.435.27.813.395.751.25 1.82.414 3.024.414s2.273-.163 3.024-.414c.378-.126.648-.265.813-.395a.619.619 0 0 0 .146-.15.148.148 0 0 0 .015-.033L12 14v-.004a.301.301 0 0 0-.057-.09 1.318 1.318 0 0 0-.37-.264c-.376-.198-.943-.375-1.655-.493a.5.5 0 1 1 .164-.986c.77.127 1.452.328 1.957.594C12.5 13 13 13.4 13 14c0 .426-.26.752-.544.977-.29.228-.68.413-1.116.558-.878.293-2.059.465-3.34.465-1.281 0-2.462-.172-3.34-.465-.436-.145-.826-.33-1.116-.558C3.26 14.752 3 14.426 3 14c0-.599.5-1 .961-1.243.505-.266 1.187-.467 1.957-.594a.5.5 0 0 1 .575.411z" ' +
                      'fill-rule="evenodd"/>' +
              '</svg>' +
            '</div>' +
            '<div>' +
              '<span>' + product['ff889249fdf2a050f358d1123539ce8f310fcf87_route'] + '</span><br>' +
              '<span>' + product['ff889249fdf2a050f358d1123539ce8f310fcf87_locality'].toUpperCase() + ' (' + product['ff889249fdf2a050f358d1123539ce8f310fcf87_postal_code'] + ')</span>' +
            '</div>' +
          '</div><br>' +
          '<div>' +
            '<span class="align-items-around d-flex">' +
              '<span class="align-items-center d-flex">' +
                '<svg class="bi bi-wallet2" ' +
                     'fill="rgba(0, 0, 0, 1)" ' +
                     'height="24" ' +
                     'viewBox="0 0 16 16" ' +
                     'width="24" ' +
                     'xmlns="http://www.w3.org/2000/svg">' +
                  '<path d="M12.136.326A1.5 1.5 0 0 1 14 1.78V3h.5A1.5 1.5 0 0 1 16 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-9a1.5 1.5 0 0 1 1.432-1.499L12.136.326zM5.562 3H13V1.78a.5.5 0 0 0-.621-.484L5.562 3zM1.5 4a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z"/>' +
                '</svg>' +
                '&nbsp;&nbsp;<b>' + TOTAL_INVESTMENT.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €</b>&nbsp;&sup1;' +
              '</span>' +
              '<span style="width: 100px;"></span>' +
              '<span class="align-items-center d-flex">' +
                '<svg class="bi bi-graph-up-arrow" fill="rgba(0, 0, 0, 1)" height="24" viewBox="0 0 16 16" width="24" xmlns="http://www.w3.org/2000/svg">' +
                  '<path d="M0 0h1v15h15v1H0V0Zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5Z" ' +
                        'fill-rule="evenodd"/>' +
                '</svg>' +
                '&nbsp;&nbsp;<b>' + PROFITABILITY.toString().replace('.', ',') + ' %</b>&nbsp;&sup2;' +
              '</span>' +
            '</span>' +
          '</div><br>' +
          getCarousel(product, carouselIndex) + '<br>' +
          '<a href="' + STORE + '" ' +
             'target="_blank">En savoir plus</a>'
        ).on('click', marker => setView(marker));

      carouselIndex++;

      ADDRESS_MARKER_LIST.push(MARKER);
      ADDRESS_LIST.push({
        card:
          '<div class="align-items-center bg-white d-flex rounded-4" ' +
               'onmouseleave="this.classList.remove(\'shadow\');" ' +
               'onmouseover="this.classList.add(\'shadow\');" ' +
               'style="border: rgba(0, 0, 0, .1) solid 1px; border-radius: 0 16px 16px 0; cursor: pointer; margin: 20px; padding: 10px">' +
            '<div style="max-width: 37.5%;">' + getCarousel(product, carouselIndex) + '</div>' +
            '<div class="d-flex flex-column justify-content-around" ' +
                 'onclick="loadMarkers(ADDRESS_MARKERS, \'address\'); ' +
                          'setView(ADDRESS_MARKER_LIST[' + (carouselIndex / 2 - 1) + '], 15);" ' +
                 'style="padding: 20px; width: 62.5%;">' +
              '<div class="d-flex justify-content-between">' +
                '<div class="align-items-center d-flex">' +
                  '<div style="margin-right: 10px;">' +
                    '<svg class="bi bi-geo" fill="rgba(0, 0, 0, 1)" height="24" viewBox="0 0 16 16" width="24" xmlns="http://www.w3.org/2000/svg">' +
                      '<path d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999zm2.493 8.574a.5.5 0 0 1-.411.575c-.712.118-1.28.295-1.655.493a1.319 1.319 0 0 0-.37.265.301.301 0 0 0-.057.09V14l.002.008a.147.147 0 0 0 .016.033.617.617 0 0 0 .145.15c.165.13.435.27.813.395.751.25 1.82.414 3.024.414s2.273-.163 3.024-.414c.378-.126.648-.265.813-.395a.619.619 0 0 0 .146-.15.148.148 0 0 0 .015-.033L12 14v-.004a.301.301 0 0 0-.057-.09 1.318 1.318 0 0 0-.37-.264c-.376-.198-.943-.375-1.655-.493a.5.5 0 1 1 .164-.986c.77.127 1.452.328 1.957.594C12.5 13 13 13.4 13 14c0 .426-.26.752-.544.977-.29.228-.68.413-1.116.558-.878.293-2.059.465-3.34.465-1.281 0-2.462-.172-3.34-.465-.436-.145-.826-.33-1.116-.558C3.26 14.752 3 14.426 3 14c0-.599.5-1 .961-1.243.505-.266 1.187-.467 1.957-.594a.5.5 0 0 1 .575.411z" ' +
                            'fill-rule="evenodd"/>' +
                    '</svg>' +
                  '</div>' +
                  '<div>' +
                    '<span>' + product['ff889249fdf2a050f358d1123539ce8f310fcf87_route'] + '</span><br>' +
                    '<span>' + product['ff889249fdf2a050f358d1123539ce8f310fcf87_locality'].toUpperCase() + ' (' + product['ff889249fdf2a050f358d1123539ce8f310fcf87_postal_code'] + ')</span>' +
                  '</div>' +
                '</div>' +
                '<div class="text-end text-secondary" id="distance' + carouselIndex + '"></div>' +
              '</div>' +
              '<div>' +
                '<span class="d-flex justify-content-between">' +
                  '<span class="align-items-center d-flex">' +
                    '<svg class="bi bi-wallet2" ' +
                         'fill="rgba(0, 0, 0, 1)" ' +
                         'height="24" ' +
                         'viewBox="0 0 16 16" ' +
                         'width="24" ' +
                         'xmlns="http://www.w3.org/2000/svg">' +
                      '<path d="M12.136.326A1.5 1.5 0 0 1 14 1.78V3h.5A1.5 1.5 0 0 1 16 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-9a1.5 1.5 0 0 1 1.432-1.499L12.136.326zM5.562 3H13V1.78a.5.5 0 0 0-.621-.484L5.562 3zM1.5 4a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z"/>' +
                    '</svg>' +
                    '&nbsp;&nbsp;<b>' + TOTAL_INVESTMENT.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €</b>&nbsp;&sup1;' +
                  '</span>' +
                  '<span class="align-items-center d-flex">' +
                    '<svg class="bi bi-graph-up-arrow" ' +
                         'fill="rgba(0, 0, 0, 1)" ' +
                         'height="24" ' +
                         'viewBox="0 0 16 16" ' +
                         'width="24" ' +
                         'xmlns="http://www.w3.org/2000/svg">' +
                      '<path d="M0 0h1v15h15v1H0V0Zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5Z" ' +
                            'fill-rule="evenodd"/>' +
                    '</svg>' +
                    '&nbsp;&nbsp;<b>' + PROFITABILITY.toString().replace('.', ',') + ' %</b>&nbsp;&sup2;' +
                  '</span>' +
                '</span>' +
              '</div>' +
              '<a href="' + STORE + '" ' +
                 'target="_blank">En savoir plus</a>' +
            '</div>' +
          '</div>',
        id: carouselIndex,
        latitude: response.results[0].geometry.location.lat,
        longitude: response.results[0].geometry.location.lng,
        profitability: PROFITABILITY,
        region: product['ff889249fdf2a050f358d1123539ce8f310fcf87_admin_area_level_1'],
        totalInvestment: TOTAL_INVESTMENT
      });

      carouselIndex++;

      loadList();
    });
};

/*  Loads a list based on the selected radio input value and the values of two select options.
 *  This function does not require any parameters as it retrieves the necessary values directly from the DOM.
 *  It then performs the necessary operations to load the list accordingly.
 */
const loadList = _ => {
  const SELECTED_REGION = $('#regionSelect').val();

  let cards = '';
  let regions = {};
  let sortedList = [];

  ADDRESS_LIST.forEach(address => {
    regions[address.region] = regions[address.region] === undefined ? 1 : regions[address.region] + 1;
    if (['Toutes', address.region].includes($('#regionSelect').val())) sortedList.push(address);
  });

  switch ($('#sort').val()) {
    case 'totalInvestmentDescending':
      sortedList = sortedList.sort((a, b) => b.totalInvestment - a.totalInvestment);
      break;
    case 'totalInvestmentAscending':
      sortedList = sortedList.sort((a, b) => a.totalInvestment - b.totalInvestment);
      break;
    case 'profitabilityDescending':
      sortedList = sortedList.sort((a, b) => b.profitability - a.profitability);
      break;
    case 'profitabilityAscending':
      sortedList = sortedList.sort((a, b) => a.profitability - b.profitability);
      break;
  }

  sortedList.forEach(address => cards += address.card);
  cards += '<div style="border-top: rgba(0, 0, 0, .1) solid 1px; padding: 10px;">&sup1; Investissement total, &sup2; Rentabilité brute</div>';

  $('#counter').html(sortedList.length);
  $('#regionSelect').html('<option value="Toutes">Toutes (' + ADDRESS_LIST.length + ')</option>');
  Object.keys(regions).sort().forEach(region => $('#regionSelect').append('<option value="' + region + '">' + region + ' (' + regions[region] + ')</option>'));
  $('#regionSelect').val(SELECTED_REGION);
  $('#list').html(cards);
};

/*  Removes all existing layers on a map, adds a new layer, and checks the radio input with the provided ID.
 *    @param {Layer} layer - The layer to be added to the map.
 *    @param {string} radioInputId - The ID of the radio input to be checked.
 */
const loadMarkers = (layer, radioInputId) => {
  MAP.removeLayer(REGION_MARKERS);
  MAP.removeLayer(ADDRESS_MARKERS);
  MAP.addLayer(layer);
  $('#' + radioInputId).prop('checked', true);
};

/*  Calculates and prints the distance and travel time between a given location and a set list of addresses.
 *    @param {location} location - The starting location for calculating distances and travel times.
 */
const setTravelInformations = location => {
  if (location) {
    ADDRESS_LIST.forEach(address => {
      fetch('https://europe-west1-single-odyssey-372313.cloudfunctions.net/fetch?name=directions' +
        '&originLatitude=' + location.latitude + '&originLongitude=' + location.longitude +
        '&destinationLatitude=' + address.latitude + '&destinationLongitude=' + address.longitude)
        .then(response => response.json())
        .then(response => {
          const DISTANCE =
            response.routes[0].distanceMeters > 999 ?
              String(response.routes[0].distanceMeters).substring(0, String(response.routes[0].distanceMeters).length - 3).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') :
              'moins d\'un';
          const MINUTES = '0' + Math.round(parseInt(response.routes[0].duration) / 60 % 60);
          const TRAVEL_TIME =
            parseInt(response.routes[0].duration) > 3600 ?
              Math.round(parseInt(response.routes[0].duration) / 60 / 60) + 'h' + MINUTES.substring(MINUTES.length - 2, MINUTES.length) :
              Math.round(parseInt(response.routes[0].duration) / 60) + ' min';

          $('#distance' + address.id).html('à ' + DISTANCE + ' km<br>soit ' + TRAVEL_TIME + ' en voiture');
        });
    });
  }
};

/*  Adjusts the view and zoom level of an interactive map based on the given marker and zoom level.
 *    @param {marker} marker - The marker representing the new position on the map.
 *    @param {number} zoom - The desired zoom level for the map.
 */
const setView = (marker, zoom) => {
  const MARKER_ZOOM = ['Auvergne-Rhône-Alpes',
                       'Bourgogne-Franche-Comté',
                       'Bretagne',
                       'Centre-Val de Loire',
                       'Corse',
                       'Grand Est',
                       'Grand Ouest',
                       'Hauts-de-France',
                       'Île-de-France',
                       'Normandie',
                       'Nouvelle-Aquitaine',
                       'Occitanie',
                       'Pays de la Loire',
                       'Provence-Alpes-Côte d\'Azur'].indexOf(marker?.sourceTarget?.options.title) > -1 ? 7.5 : 15;
  MAP.flyTo(
    marker?.latlng ? marker?.latlng : marker?._latlng ? marker?._latlng : [46.227638, 2.213749],
    marker === undefined ? 6 : zoom ? zoom : MAP.getZoom() > MARKER_ZOOM ? MAP.getZoom() : MARKER_ZOOM
  );
  if (marker?.options?.title) marker.openPopup();
};