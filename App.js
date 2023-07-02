import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, {useState, useEffect} from 'react';
import MapView from 'react-native-maps';
import { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import Realm from 'realm';
import {createRealmContext} from '@realm/react';

// Define your object model
class GarbageMarker extends Realm.Object {
  static schema = {
    name: 'GarbageMarker',
    properties: {
      title: 'string',
      description: 'string',
      latitude: 'float',
      longitude: 'float',
      _id: 'objectId',
    },
    primaryKey: '_id',
  };
}

class Profile extends Realm.Object {
  static schema = {
    name: 'Profile',
    properties: {
      _id: 'objectId',
      name: 'string',
    },
    primaryKey: '_id',
  };
}

// Create a configuration object
const realmConfig = {
  schema: [GarbageMarker, Profile],
};
// Create a realm context
const {RealmProvider, useRealm, useObject, useQuery} =
  createRealmContext(realmConfig);

const tokyoRegion = {
  latitude: 35.6762,
  longitude: 139.6503,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

function MapScreen() {

  const [position, setPosition] = useState(null);

  

  useEffect(() => {
    (async () => {
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
    })();
  }, []);


  return (
    <View style={{ flex: 1 }}>
      {position &&
      <MapView
        style={styles.map}
        initialRegion={position}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={true}
        showsCompass={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}>
          <Marker
            title='You are here'
            description='This is a description'
            coordinate={position}
            //onPress={() => {toggleMarkerBox()}}

          >
            <Callout tooltip={true}>
              {/* <View style={styles.markerBox}>
                <View>
                  <Text> Title </Text>
                  <Text> Description </Text>

                </View>
              </View> */}

            </Callout>
          </Marker>
      </MapView>
      } 
    </View>
  )
}

function AddScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Add</Text>
    </View>
  )
}

function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Profile</Text>
    </View>
  )
}

function MoreScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>More</Text>
    </View>
  )
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <RealmProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Map" component={MapScreen} />
          <Tab.Screen name="Add" component={AddScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
          <Tab.Screen name="More" component={MoreScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </RealmProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerBox: {
    margin: 20,
    flex: 1

    
  }
});
