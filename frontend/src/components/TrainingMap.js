import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

/**
 * Componente para mostrar un mapa con la ruta de un entrenamiento
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.coordinates - Coordenadas de la ruta [{ latitude, longitude, elevation, timestamp }]
 * @param {number} props.height - Altura del mapa (por defecto: 300)
 * @param {boolean} props.showMarkers - Si se deben mostrar marcadores de inicio y fin
 * @param {string} props.routeColor - Color de la ruta (por defecto: color primario del tema)
 */
const TrainingMap = ({ 
  coordinates = [], 
  height = 300, 
  showMarkers = true,
  routeColor = null
}) => {
  const theme = useTheme();
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Color de la ruta
  const lineColor = routeColor || theme.colors.primary;
  
  useEffect(() => {
    // Si no hay coordenadas, intentar obtener la ubicación actual
    if (!coordinates || coordinates.length === 0) {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          
          if (status !== 'granted') {
            setError('Se requieren permisos de ubicación para mostrar el mapa');
            setLoading(false);
            return;
          }
          
          const location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;
          
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } catch (err) {
          setError('No se pudo obtener la ubicación actual');
        } finally {
          setLoading(false);
        }
      })();
    } else {
      // Calcular la región que abarca todas las coordenadas
      calculateRegion(coordinates);
      setLoading(false);
    }
  }, [coordinates]);
  
  // Calcular la región que abarca todas las coordenadas
  const calculateRegion = (coords) => {
    if (!coords || coords.length === 0) return;
    
    let minLat = coords[0].latitude;
    let maxLat = coords[0].latitude;
    let minLng = coords[0].longitude;
    let maxLng = coords[0].longitude;
    
    coords.forEach(coord => {
      minLat = Math.min(minLat, coord.latitude);
      maxLat = Math.max(maxLat, coord.latitude);
      minLng = Math.min(minLng, coord.longitude);
      maxLng = Math.max(maxLng, coord.longitude);
    });
    
    // Añadir un margen
    const latDelta = (maxLat - minLat) * 1.2;
    const lngDelta = (maxLng - minLng) * 1.2;
    
    setRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    });
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { height }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  if (!region) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.errorText}>No hay datos de ubicación disponibles</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        showsScale
      >
        {coordinates && coordinates.length > 0 && (
          <>
            <Polyline
              coordinates={coordinates}
              strokeWidth={4}
              strokeColor={lineColor}
            />
            
            {showMarkers && (
              <>
                {/* Marcador de inicio */}
                <Marker
                  coordinate={coordinates[0]}
                  title="Inicio"
                  pinColor="green"
                />
                
                {/* Marcador de fin */}
                <Marker
                  coordinate={coordinates[coordinates.length - 1]}
                  title="Fin"
                  pinColor="red"
                />
              </>
            )}
          </>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 16,
  },
});

export default TrainingMap;
