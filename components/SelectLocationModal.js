import { Alert, StyleSheet, View, Linking } from 'react-native';
import {
  Button,
  ActivityIndicator,
  Appbar,
  FAB,
  Modal,
  Portal,
  useTheme,
} from 'react-native-paper';
import React, { useState, useRef, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapTypeDialog } from './MapTypeDialog';

export function SelectLocationModal(props) {
  const [mapTypeDialogOpen, setMapTypeDialogOpen] = useState(false);
  const [mapType, setMapType] = useState('hybrid');
  const mapRef = useRef(null);
  const theme = useTheme();

  const defaultRegion = {
    latitude: 49.2827,
    longitude: -123.1207,
    latitudeDelta: 0.0421,
    longitudeDelta: 0.001,
  };

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
  useEffect(() => {
    const setInitialLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        props.setPosition(defaultRegion);
        return;
      }
      const location = await Location.getLastKnownPositionAsync({});
      props.setPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0421,
        longitudeDelta: 0.0421,
      });
    };
    if (props.modalVisible && props.position === null) {
      setInitialLocation();
    }
  }, [props.modalVisible]);

  return (
    <Portal>
      <Modal
        visible={props.modalVisible}
        onDismiss={() => {
          props.setModalVisible(!props.modalVisible);
        }}
        contentContainerStyle={{
          flex: 1,
        }}
      >
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => props.setModalVisible(!props.modalVisible)}
          />
          <Appbar.Content
            title="Hold and drag the marker to move it"
            titleStyle={styles.title}
          />
        </Appbar.Header>
        {props.position ? (
          <View style={{ flex: 1 }}>
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
              </View>
              <Button
                onPress={() => props.setModalVisible(!props.modalVisible)}
                style={styles.button}
                mode="contained"
              >
                Done
              </Button>
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
                initialRegion={props.position}
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
                minZoomLevel={15}
              >
                <Marker
                  draggable
                  coordinate={props.position}
                  onDragEnd={(e) => {
                    props.setPosition({
                      ...e.nativeEvent.coordinate,
                      latitudeDelta: 0.0421,
                      longitudeDelta: 0.0421,
                    });
                  }}
                  pinColor={theme.colors.primary}
                />
              </MapView>
            </>
          </View>
        ) : (
          <ActivityIndicator animating size="large" style={styles.container} />
        )}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 16,
  },

  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    position: 'absolute',
    zIndex: 100,
    bottom: 10,
    alignSelf: 'center',
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  map: {
    flex: 1,
    minHeight: 300,
  },
  imageBox: {
    width: 300,
    height: 300,
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
});
