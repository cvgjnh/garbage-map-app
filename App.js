import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, {useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { MapScreen } from './components/MapScreen';
import { AddScreen } from './components/AddScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { MoreScreen } from './components/MoreScreen';


const tokyoRegion = {
  latitude: 35.6762,
  longitude: 139.6503,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

    return subscriber;
  }, []);

  function onAuthStateChanged(user) {
    if (user) {
      const uid = user.uid;
      const data = {
        uid: uid,
        email: user.email,
        username: uid.substring(0, 8),
      };
      const usersRef = firestore().collection('users');
      usersRef
        .doc(uid)
        .get()
        .then(firestoreDocument => {
          if (!firestoreDocument.exists) {
            usersRef
              .doc(data.uid)
              .set(data)
            setUser(data);
          }
          else {
            setUser(firestoreDocument.data());
          }
        })
        .catch(error => {
          Alert.alert(JSON.stringify(error.message));
          console.log('Error getting document:', error);
        });
    }
    else {
      setUser(null);
    }
  }


  return (

    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen 
          name="Map"
          children={() => <MapScreen user={user}/>}
        />
        <Tab.Screen 
          name="Add"
          children={() => <AddScreen user={user} onAuthStateChanged={onAuthStateChanged}/>}
        />
        <Tab.Screen 
          name="Profile"
          children={() => <ProfileScreen user={user} setUser={setUser} onAuthStateChanged={onAuthStateChanged}/>}
        />
        <Tab.Screen name="More" component={MoreScreen} />
      </Tab.Navigator>
    </NavigationContainer>

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
