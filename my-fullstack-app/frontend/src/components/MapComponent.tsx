import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";

interface MapComponentProps {
    camps: any[];
    center: { lat: number; lng: number };
    onMarkerClick?: (camp: any) => void;
}

const libraries: ("places")[] = ["places"];

const MapComponent = ({ camps, center, onMarkerClick }: MapComponentProps) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    const mapContainerStyle = {
        width: "100%",
        height: "400px",
        borderRadius: "0.5rem",
    };

    const options = useMemo(
        () => ({
            disableDefaultUI: false,
            clickableIcons: false,
            zoomControl: true,
        }),
        []
    );

    if (loadError) {
        return (
            <div className="flex justify-center items-center h-[400px] bg-muted rounded-lg border border-destructive/50">
                <div className="text-center p-4">
                    <p className="text-destructive font-semibold mb-2">Error loading map</p>
                    <p className="text-sm text-muted-foreground">{loadError.message}</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center h-[400px] bg-muted rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={center}
            options={options}
        >
            {camps.map((camp) => (
                camp.coordinates && camp.coordinates.lat && camp.coordinates.lng && (
                    <Marker
                        key={camp._id}
                        position={{ lat: camp.coordinates.lat, lng: camp.coordinates.lng }}
                        onClick={() => onMarkerClick && onMarkerClick(camp)}
                        title={camp.name}
                    />
                )
            ))}
            {/* Current Location Marker (Blue Dot equivalent) */}
            <Marker
                position={center}
                icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 7,
                    fillColor: "#4285F4",
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                }}
                title="You are here"
            />
        </GoogleMap>
    );
};

export default MapComponent;
