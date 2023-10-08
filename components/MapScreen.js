import { StyleSheet, View, Alert, Linking } from 'react-native';
import { Text, Button, FAB, useTheme } from 'react-native-paper';
import React, { useState, useEffect, useRef, useContext } from 'react';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import * as geofirestore from 'geofirestore';
import { MarkerModal } from './MarkerModal';
import { MarkerPreview } from './MarkerPreview';
import { MapTypeDialog } from './MapTypeDialog';
import { UserContext } from '../UserContext';

export function MapScreen() {
  const [markers, setMarkers] = useState([]);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [firstRender, setFirstRender] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mapType, setMapType] = useState('hybrid');
  const [mapTypeDialogOpen, setMapTypeDialogOpen] = useState(false);
  const [loadMarkersButtonVisible, setLoadMarkersButtonVisible] =
    useState(false);
  const [loadingMarkers, setLoadingMarkers] = useState(false);
  const [loadMarkersToggle, setLoadMarkersToggle] = useState(false);
  const GeoFirestore = geofirestore.initializeApp(firestore());
  const mapRef = useRef(null);
  const navigation = useNavigation();
  const { user } = useContext(UserContext);

  const defaultRegion = {
    latitude: 49.2827,
    longitude: -123.1207,
    latitudeDelta: 0.0421,
    longitudeDelta: 0.001,
  };

  const theme = useTheme();

  async function centerOnUser() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Please enable location permissions in your settings',
        'This feature requires location permissions to function.',
        [
          {
            text: 'Not now',
          },
          {
            text: 'OK',
            onPress: () => Linking.openSettings(),
          },
        ]
      );
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    mapRef.current.animateCamera(
      {
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      },
      { duration: 1000 }
    );
  }

  function handleMarkerPress(marker) {
    // if the info box is already open for this marker, close it
    if (selectedMarker === marker) {
      setSelectedMarker(null);
    }
    // if the info box is on another marker or its closed, open it and set the selected marker
    else {
      setSelectedMarker(marker);
    }
  }

  useEffect(() => {
    const setInitialLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Please enable location permissions in your settings',
          'This app requires location permissions to function properly.',
          [
            {
              text: 'Not now',
            },
            {
              text: 'OK',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        setCurrentRegion(defaultRegion);
        return;
      }
      const location = await Location.getLastKnownPositionAsync({});
      setCurrentRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0421,
        longitudeDelta: 0.001,
      });
    };

    setInitialLocation();
  }, []);

  useEffect(() => {
    if (!selectedMarker) return;

    const unsubscribe = firestore()
      .collection('markers')
      .doc(selectedMarker.id)
      .onSnapshot((documentSnapshot) => {
        if (!documentSnapshot.exists) {
          setSelectedMarker(null);
          return;
        }
        setSelectedMarker({
          ...documentSnapshot.data(),
          id: documentSnapshot.id,
        });
      });
    // eslint-disable-next-line consistent-return
    return () => unsubscribe();
  }, [selectedMarker?.id]);

  useEffect(() => {
    if (!currentRegion) {
      return;
    }
    let isInitialAdd = true;
    const unsubscribe = GeoFirestore.collection('markers')
      .near({
        center: new firestore.GeoPoint(
          currentRegion.latitude,
          currentRegion.longitude
        ),
        radius: ((currentRegion.latitudeDelta * Math.PI) / 180) * 6371,
      })
      .onSnapshot((snapshot) => {
        // on the initial snapshot, replace the markers state with the markers in the query
        if (isInitialAdd) {
          const newMarkers = [];
          snapshot.forEach((documentSnapshot) => {
            newMarkers.push({
              ...documentSnapshot.data(),
              id: documentSnapshot.id,
            });
          });
          setMarkers(newMarkers);
          isInitialAdd = false;
          setLoadingMarkers(false);
          setLoadMarkersButtonVisible(false);
        } else {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              setMarkers((prevMarkers) => [
                { ...change.doc.data(), id: change.doc.id },
                ...prevMarkers,
              ]);
            }

            if (change.type === 'modified') {
              setMarkers((prevMarkers) =>
                prevMarkers.map((marker) => {
                  if (marker.id === change.doc.id) {
                    return {
                      ...change.doc.data(),
                      id: change.doc.id,
                    };
                  }
                  return marker;
                })
              );
            }
            if (change.type === 'removed') {
              setMarkers((prevMarkers) =>
                prevMarkers.filter((marker) => {
                  return marker.id !== change.doc.id;
                })
              );
            }
          });
        }
      });

    // eslint-disable-next-line consistent-return
    return () => {
      unsubscribe();
    };
  }, [loadMarkersToggle]);

  useEffect(() => {
    if (firstRender && currentRegion) {
      setFirstRender(false);
      setLoadMarkersToggle(!loadMarkersToggle);
    }
  }, [currentRegion]);

  return (
    <>
      <MarkerModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedMarker={selectedMarker}
      />
      {selectedMarker && (
        <MarkerPreview
          selectedMarker={selectedMarker}
          setModalVisible={setModalVisible}
        />
      )}
      {loadMarkersButtonVisible && (
        <Button
          style={styles.loadMarkersButton}
          onPress={() => {
            // updateMarkers(currentRegion)
            setLoadMarkersToggle(!loadMarkersToggle);
            setLoadingMarkers(true);
          }}
          mode="contained"
          loading={loadingMarkers}
        >
          Load Markers for this Area
        </Button>
      )}
      <View style={{ flex: 1 }}>
        {currentRegion ? (
          <>
            <View style={styles.fabBar}>
              <FAB
                style={styles.fab}
                icon="crosshairs-gps"
                size="medium"
                onPress={() => centerOnUser()}
              />
              <FAB
                style={styles.fab}
                icon="map"
                size="medium"
                onPress={() => setMapTypeDialogOpen(true)}
              />
              <FAB
                style={styles.fab}
                icon="plus"
                size="medium"
                onPress={() => {
                  if (!user) {
                    navigation.navigate('Profile');
                    return;
                  }
                  navigation.navigate('Add');
                }}
              />
            </View>

            <MapTypeDialog
              dialogVisible={mapTypeDialogOpen}
              setDialogVisible={setMapTypeDialogOpen}
              mapType={mapType}
              setMapType={setMapType}
            />
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={currentRegion}
              showsUserLocation
              showsMyLocationButton={false}
              showsCompass
              scrollEnabled
              zoomEnabled
              pitchEnabled={false}
              loadingEnabled
              mapType={mapType}
              paddingAdjustmentBehavior="always"
              toolbarEnabled={false}
              onPress={() => {
                setSelectedMarker(null);
              }}
              minZoomLevel={15}
              onRegionChangeComplete={(region) => {
                setLoadMarkersButtonVisible(true);
                setCurrentRegion(region);
              }}
            >
              {markers.map((marker) => {
                // I can only have one image per marker so if I represented each trash type in the marker icon,
                // I would have to have a different image for each combination of trash types
                // With four trash types, that would be 15 images and if I ever changed the style, I would have to change all 15 images
                return (
                  <Marker
                    key={marker.id}
                    coordinate={{
                      latitude: marker.coordinates.latitude,
                      longitude: marker.coordinates.longitude,
                    }}
                    onPress={() => {
                      handleMarkerPress(marker);
                    }}
                    tappable={false}
                    pinColor={theme.colors.primary}
                  >
                    <Callout tooltip>
                      <Text />
                    </Callout>
                  </Marker>
                );
              })}
            </MapView>
          </>
        ) : (
          <Text>Loading...</Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoBox: {
    backgroundColor: 'white',
    bottom: 10,
    left: 10,
    right: 10,
    borderWidth: 1,
    zIndex: 100,
    position: 'absolute',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  imageBox: {
    width: 300,
    height: 300,
    alignSelf: 'center',
  },
  fab: {
    margin: 5,
  },
  fabBar: {
    position: 'absolute',
    zIndex: 100,
    right: 0,
    top: 5,
    flexDirection: 'column',
  },
  loadMarkersButton: {
    position: 'absolute',
    zIndex: 100,
    alignSelf: 'center',
    margin: 10,
  },
});
