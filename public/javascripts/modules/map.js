import axios from 'axios'
import { $ } from './bling'


//TO DO: figure out navigator.geolocation.getCurrentPosition and replace these defaults

const mapOptions = {
    center: { lat: 40.77, lng: -73.91 },
    zoom: 9
}

function loadPlaces(map, lat = 40.77, lng = -73.91) {
    axios.get(`/api/applications/near?lat=${lat}&lng=${lng}`)
    .then(res => {
        const places = res.data
        if(!places.length) {
            alert('no places found!')
            return
        }

        //creat boungs

        const bounds = new google.maps.LatLngBounds()

        //location info
        const infoWindow = new google.maps.InfoWindow()


        //create markers
        const markers = places.map(place => {
            const [placeLng, placeLat] = place.location.coordinates;
            const position = { lat: placeLat, lng: placeLng}
            bounds.extend(position)
            const marker = new google.maps.Marker({map, position})
            marker.place = place
            return marker
        })

        //show details on click
        markers.forEach(marker => marker.addListener('click', function(){
            const html= `
                <div class="popup">
                    <a href="/stores/${this.place.slug}">
                        <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}" />
                        <p>${this.place.name} - ${this.place.location.address}</p>
                    </a>
                </div>
            `
            infoWindow.setContent(html)
            infoWindow.open(map, this)
        }))


        //zoom to fit
        map.setCenter(bounds.getCenter())
        map.fitBounds(bounds)
    })
}

function makeMap(mapDiv) {
    if(!mapDiv) return

    const map = new google.maps.Map(mapDiv, mapOptions)
    loadPlaces(map)
    const input = $('[name="geolocate"]')
    const autocomplete = new google.maps.places.Autocomplete(input)
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng())
    })
 
}

export default makeMap