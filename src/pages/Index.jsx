import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 40.7128,
  lng: -74.0060
};

const fetchWeatherData = async (lat, lon) => {
  const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your actual API key
  const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
  return response.data;
};

const Index = () => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filters, setFilters] = useState({
    maxRent: 2000,
    minSafety: 5,
    minWalkability: 5
  });

  const { data: weatherData, isLoading: isWeatherLoading } = useQuery(
    ['weather', selectedLocation],
    () => selectedLocation && fetchWeatherData(selectedLocation.lat, selectedLocation.lng),
    { enabled: !!selectedLocation }
  );

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const handleMapClick = (event) => {
    const newMarker = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    setMarkers([...markers, newMarker]);
    setSelectedLocation(newMarker);
  };

  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Find Your Ideal Living Location</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Max Rent</CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={[filters.maxRent]}
              onValueChange={(value) => handleFilterChange('maxRent', value[0])}
              max={5000}
              step={100}
            />
            <p className="mt-2">Max Rent: ${filters.maxRent}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Min Safety</CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={[filters.minSafety]}
              onValueChange={(value) => handleFilterChange('minSafety', value[0])}
              max={10}
              step={1}
            />
            <p className="mt-2">Min Safety: {filters.minSafety}/10</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Min Walkability</CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={[filters.minWalkability]}
              onValueChange={(value) => handleFilterChange('minWalkability', value[0])}
              max={10}
              step={1}
            />
            <p className="mt-2">Min Walkability: {filters.minWalkability}/10</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
          >
            {markers.map((marker, index) => (
              <Marker key={index} position={marker} />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>

      {selectedLocation && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Selected Location Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Latitude: {selectedLocation.lat}</p>
            <p>Longitude: {selectedLocation.lng}</p>
            {isWeatherLoading ? (
              <p>Loading weather data...</p>
            ) : weatherData ? (
              <div>
                <p>Temperature: {weatherData.main.temp}°C</p>
                <p>Weather: {weatherData.weather[0].description}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;
