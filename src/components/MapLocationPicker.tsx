"use client"

import { useState, useCallback } from "react"
import { useLoadScript, Autocomplete, GoogleMap, Marker } from "@react-google-maps/api"
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"

const libraries: "places"[] = ["places"]

export interface LocationData {
    address: string
    lat: number | null
    lng: number | null
}

interface MapLocationPickerProps {
    onLocationChange: (data: LocationData) => void
    error?: string
}

const mapContainerStyle = {
    width: "100%",
    height: "140px",
    borderRadius: "1rem"
}

export function MapLocationPicker({ onLocationChange, error }: MapLocationPickerProps) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    })

    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
    const [location, setLocation] = useState<LocationData>({ address: "", lat: null, lng: null })

    const onLoad = useCallback((autoC: google.maps.places.Autocomplete) => {
        setAutocomplete(autoC)
    }, [])

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace()
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat()
                const lng = place.geometry.location.lng()
                const address = place.formatted_address || place.name || ""

                const newLoc = { address, lat, lng }
                setLocation(newLoc)
                onLocationChange(newLoc)
            }
        } else {
            console.log("Autocomplete is not loaded yet!")
        }
    }

    if (loadError) {
        return (
            <div className="space-y-2">
                <Input
                    placeholder="Enter property address (Manual mode)"
                    onChange={(e) => onLocationChange({ address: e.target.value, lat: null, lng: null })}
                />
                <p className="text-xs text-red-500">Google Maps failed to load.</p>
            </div>
        )
    }

    if (!isLoaded) {
        return (
            <div className="space-y-2">
                <div className="h-12 bg-slate-100 rounded-[1rem] animate-pulse"></div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-[#115e59] opacity-70" />
                    <Input
                        placeholder="Search for a location..."
                        className="pl-11 border-slate-200 bg-white shadow-soft"
                        defaultValue={location.address}
                        onChange={(e) => {
                            // Only update parent address state, clear lat/lng to signify manual edit
                            setLocation({ ...location, address: e.target.value })
                            onLocationChange({ address: e.target.value, lat: null, lng: null })
                        }}
                    />
                </div>
            </Autocomplete>
            {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}

            {location.lat && location.lng && (
                <div className="overflow-hidden rounded-[1rem] shadow-soft border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={{ lat: location.lat, lng: location.lng }}
                        zoom={15}
                        options={{
                            disableDefaultUI: true,
                            zoomControl: true,
                        }}
                    >
                        <Marker position={{ lat: location.lat, lng: location.lng }} />
                    </GoogleMap>
                </div>
            )}
        </div>
    )
}
