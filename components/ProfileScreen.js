import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, {useState, useEffect} from 'react';
import MapView from 'react-native-maps';
import { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Realm from 'realm';
import {createRealmContext} from '@realm/react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Dialog from "react-native-dialog";

import { GoogleSignIn, GoogleSignOut } from './GoogleSignIn';

function UsernameDialog(props) {
  const [username, setUsername] = useState(props.user.username)

  const changeUsername = () => {
    //query firestore for username
    //if username exists, alert user
    //else, update username in firestore
    const usersRef = firestore().collection('users');
    const usernameQuery = usersRef.where('username', '==', username);
    if (usernameQuery.count() > 0) {
      Alert.alert('Username already exists. Please choose another one.');
    }
    else {
      const oldUsername = props.user.username;
      firestore()
        .collection('users')
        .doc(props.user.uid)
        .update({
          username: username,
        })
        .then(() => {
          console.log('Username updated in user profile!');
        });
      firestore()
        .collection('markers')
        .where('username', '==', oldUsername)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(documentSnapshot => {
            firestore()
              .collection('markers')
              .doc(documentSnapshot.id)
              .update({
                username: username,
              }) 
          })
        })
        .then(() => {console.log('Username updated in markers!')})
      firestore()
        .collection('logs')
        .where('username', '==', oldUsername)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(documentSnapshot => {
            firestore()
              .collection('logs')
              .doc(documentSnapshot.id)
              .update({
                username: username,
              }) 
          })
        })
        .then(() => {console.log('Username updated in logs!')})
        
      props.setUser(prevUser => ({...prevUser, username: username}));
      props.setEditingUsername(false);
        
    }
  }
  return (
    <View>
      <Dialog.Container visible = {props.editingUsername}>
        <Dialog.Title>Choose a unique username</Dialog.Title>
        <Dialog.Input
          onChangeText={setUsername}
          value={username}
        />
        <Dialog.Button label="Cancel" onPress={() => props.setEditingUsername(false)}/>
        <Dialog.Button label="Done" onPress={() => changeUsername()}/>
      </Dialog.Container>
    </View>
  )
}


export function ProfileScreen(props) {
    const [editingUsername, setEditingUsername] = useState(false)

  
    if (props.user) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <UsernameDialog 
            user={props.user}
            setUser={props.setUser}
            editingUsername={editingUsername}
            setEditingUsername={setEditingUsername}
          />
          <Text>Email: {props.user.email}</Text>
          <Text>Username: {props.user.username}</Text>
          <Button
            title="Edit Profile"
            onPress={() => setEditingUsername(true)}
          />
          <GoogleSignOut />
        </View>
      )
    }
  
    else {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Sign in or create an account to add map markers, write logs, and view your profile!</Text>
          <GoogleSignIn />
        </View>
      )
    }
  
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
  