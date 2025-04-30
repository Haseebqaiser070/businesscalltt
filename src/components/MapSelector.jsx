import React, { useRef, useState, useCallback, useEffect } from 'react'
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
} from '@react-google-maps/api'

const libraries = ['places']
const containerStyle = { width: '100%', height: '400px' }
const defaultCenter = { lat: 30.1621752, lng: 71.3975639 }

export default function MapSelector({ onLocationSelect, editLocation }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  // 1) Initialize markerPos + address *from* editLocation if present, else default
  const [markerPos, setMarkerPos] = useState(
    editLocation
      ? { lat: editLocation.lat, lng: editLocation.lng }
      : defaultCenter
  )
  const [address, setAddress] = useState(editLocation?.address || '')

  const autocompleteRef = useRef(null)
  const inputRef = useRef(null)
  const geocoderRef = useRef(null)
  const [map, setMap] = useState(null)

  const onLoadMap = useCallback((mapInstance) => {
    setMap(mapInstance)
    if (!geocoderRef.current && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder()
    }
  }, [])

  // 2) Only run the “default” reverse‐geocode if we’re NOT editing
  useEffect(() => {
    if (
      isLoaded &&
      map &&
      geocoderRef.current &&
      !editLocation // ← guard here
    ) {
      getAddressFromCoordinates(defaultCenter.lat, defaultCenter.lng)
    }
  }, [isLoaded, map, editLocation])

  // Reverse‐geocode helper
  const getAddressFromCoordinates = useCallback(
    (lat, lng) => {
      const geocoder = geocoderRef.current
      if (!geocoder) return

      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const newAddress = results[0].formatted_address
          setAddress(newAddress)
          if (inputRef.current) inputRef.current.value = newAddress
          onLocationSelect({ address: newAddress, lat, lng })
        }
      })
    },
    [onLocationSelect]
  )

  // Called when user picks from autocomplete
  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace()
    if (!place?.geometry) return

    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()
    const newAddress = place.formatted_address

    setMarkerPos({ lat, lng })
    setAddress(newAddress)
    map.panTo({ lat, lng })
    onLocationSelect({ address: newAddress, lat, lng })
  }

  // Map click => reverse‐geocode there
  const handleMapClick = (e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    setMarkerPos({ lat, lng })
    map.panTo({ lat, lng })
    getAddressFromCoordinates(lat, lng)
  }

  // Drag marker => reverse‐geocode there
  const handleMarkerDragEnd = (e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    setMarkerPos({ lat, lng })
    getAddressFromCoordinates(lat, lng)
  }

  // Manual typing (just update the input value)
  const handleInputChange = (e) => {
    setAddress(e.target.value)
  }

  if (!isLoaded) return <p>Loading map…</p>

  return (
    <>
      <Autocomplete
        onLoad={(ref) => (autocompleteRef.current = ref)}
        onPlaceChanged={onPlaceChanged}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Search address"
          defaultValue={address}
          onChange={handleInputChange}
          className="form-control mb-3"
        />
      </Autocomplete>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPos}
        zoom={15}
        onLoad={onLoadMap}
        onClick={handleMapClick}
      >
        <Marker
          position={markerPos}
          draggable={true}
          onDragEnd={handleMarkerDragEnd}
        />
      </GoogleMap>
    </>
  )
}
