export interface ApproximateCoordinates {
  latitude: number
  longitude: number
}

export function requestLocationOnce(): Promise<ApproximateCoordinates> {
  if (!navigator.geolocation) {
    return Promise.reject(new Error('Location is not available in this browser.'))
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied. The seeded fallback remains active.'
          : 'Location could not be read. The seeded fallback remains active.'
        reject(new Error(message))
      },
      {
        enableHighAccuracy: false,
        maximumAge: 5 * 60 * 1000,
        timeout: 10_000,
      },
    )
  })
}
