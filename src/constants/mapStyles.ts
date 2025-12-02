export const mapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#090f1c" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#8e95bd" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#050814" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [
      { color: "#3d4266" },
      { visibility: "on" },
      { weight: 1 },
    ],
  },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#5861a3" }, { weight: 1.2 }],
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#40486d" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#0b1328" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9aa0c4" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#13203b" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1c253f" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2a3354" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#3a4170" }],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [{ color: "#323b60" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0b1a33" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4f5a89" }],
  },
];

export default {
  mapStyle,
};
