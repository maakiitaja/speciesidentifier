displayMap = function (observations) {
  if (observations.length === 0) return;

  mapboxgl.accessToken =
    "pk.eyJ1IjoibWF1cmlmbGluY2ttYW4iLCJhIjoiY2t6aTE1ZTZiMjFxcTJ1bzZ2N3l5bnk3dyJ9.H7Mgh1L7jAz9xvQlTrzA3Q";

  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    scrollZoom: true,
    // center: [-118.113491, 34.111745],
    zoom: 10,
    interactive: true,
  });

  const bounds = new mapboxgl.LngLatBounds();

  observations.forEach((obs) => {
    if (obs.location.coordinates.length === 0) return;

    // Create marker
    const el = document.createElement("div");
    el.className = "marker";

    // Add marker
    console.log(obs.location.coordinates);
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(obs.location.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(obs.location.coordinates)
      .setHTML(`<p>${obs.insect.latinName}, count: ${obs.count}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(obs.location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
