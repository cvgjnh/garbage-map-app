import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Modal, Pressable } from 'react-native';
import React, {useState, useEffect} from 'react';
import MapView from 'react-native-maps';
import { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import firestore from '@react-native-firebase/firestore';
import Dialog from "react-native-dialog";
import { set } from 'react-native-reanimated';
import { FoundLogDialog } from './FoundLogDialog';
import { LogEntry } from './LogEntry';
import { DNFLogDialog } from './DNFLogDialog';


export function MapScreen(props) {

    const [position, setPosition] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [foundLogOpen, setFoundLogOpen] = useState(false);
    const [DNFLogOpen, setDNFLogOpen] = useState(false);
    const [selectedMarkerLogs, setSelectedMarkerLogs] = useState([]);
  
    useEffect(() => {
      const getMarkers = async () => {
        setMarkers([]);
        const markerDocuments = await firestore().collection('markers').get();
        markerDocuments.forEach(documentSnapshot => {
          console.log('Marker ID: ', documentSnapshot.id, documentSnapshot.data());
          setMarkers(prevMarkers => [...prevMarkers, {...documentSnapshot.data(), id: documentSnapshot.id}]);
        });
      };
  
      getMarkers();
    }, []);
      
  
    useEffect(() => {
      const centerOnUser = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }
  
        let location = await Location.getCurrentPositionAsync({});
        setPosition({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0421,
          longitudeDelta: 0.0421,
        });
      };
  
      centerOnUser();
    }, []);

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

    function onModalOpen() {
      setModalVisible(true);
      const getLogs = async () => {
        setSelectedMarkerLogs([]);
        const logDocuments = await firestore().collection('logs').where('markerId', '==', selectedMarker.id).get();
        logDocuments.forEach(documentSnapshot => {
          console.log('Log ID: ', documentSnapshot.id, documentSnapshot.data());
          setSelectedMarkerLogs(prevLogs => [...prevLogs, {...documentSnapshot.data(), id: documentSnapshot.id}]);
        });
      };
      getLogs();
    }

    return (
      <>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
              setModalVisible(!modalVisible);
          }}
        >

          <View style={styles.container}>
            <Text>Title: {selectedMarker && selectedMarker.title}</Text>
            <Text>Description: {selectedMarker && selectedMarker.description}</Text>
            <Button
              title="Found it!"
              onPress={() => {setFoundLogOpen(true)}}
            />
            <Button
              title="Could not find it"
              onPress={() => {setDNFLogOpen(true)}}
            />
            <Text>Logs</Text>
            {selectedMarkerLogs.map((log) => {
              return (
                <LogEntry key={log.id} log={log}/>
              )
            })}



          </View>

        </Modal>

        <FoundLogDialog
          selectedMarker={selectedMarker}
          foundLogOpen={foundLogOpen}
          setFoundLogOpen={setFoundLogOpen}
          user={props.user}
        />
        <DNFLogDialog
          selectedMarker={selectedMarker}
          DNFLogOpen={DNFLogOpen}
          setDNFLogOpen={setDNFLogOpen}
          user={props.user}
        />
          

        {selectedMarker && 
          <Pressable style={styles.infoBox} onPress={() => {onModalOpen()}}>
            <View >
              <Text style={styles.text}>{selectedMarker.title}</Text>
            </View>
            <Text>{selectedMarker.description}</Text>
          </Pressable>
        } 
        <View style={{ flex: 1 }}>
          {position &&
          <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={position}
              showsUserLocation={true}
              showsMyLocationButton={true}
              followsUserLocation={true}
              showsCompass={true}
              scrollEnabled={true}
              zoomEnabled={true}
              pitchEnabled={true}
              rotateEnabled={true}
              onPress={() => {setSelectedMarker(null)}}
            >
              {markers.map((marker) => {
                return (
                  <Marker
                      key={marker.id}
                      title={marker.title}
                      description={marker.description}
                      coordinate={{
                          latitude: marker.location.latitude,
                          longitude: marker.location.longitude
                      }}
                      onPress={() => {handleMarkerPress(marker)}}
                  >
                    <Callout tooltip={true}>
                      <Text></Text>
                    </Callout>
                  </Marker>
                );

              })}
                {/* <Marker
                  title='You are'
                  description='This is a description'
                  coordinate={position}
                  //onPress={() => {toggleMarkerBox()}}
      
                >
                  <Callout tooltip={true}>
      
                    <Text></Text>
      
                  </Callout>
                </Marker> */}
            </MapView>
          } 
        </View>
      </>
    )
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
  }

});


  
