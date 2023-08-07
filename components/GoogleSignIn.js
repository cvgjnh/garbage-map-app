import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, {useState, useEffect} from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export function GoogleSignIn() {
    return (
      <Button
        title="Google Sign-In"
        onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
      />
    );
}

export function GoogleSignOut() {
  return (
    <Button
      title="Sign Out"
      onPress={async () => 
        {
          const isSignedIn = await GoogleSignin.isSignedIn();
          if (isSignedIn) {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
          }
          await auth().signOut();
        }
      }
    />
  )
}

GoogleSignin.configure({
  webClientId: '451639436511-ii6eceujoj7ib8cchq6tnfd248d9afkg.apps.googleusercontent.com',
});


// async function onGoogleButtonPress() {
//   // Check if your device supports Google Play
//   await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
//   // Get the users ID token
//   const { idToken } = await GoogleSignin.signIn();

//   // Create a Google credential with the token
//   const googleCredential = auth.GoogleAuthProvider.credential(idToken);

//   // Sign-in the user with the credential
//   return auth().signInWithCredential(googleCredential);
// }

const onGoogleButtonPress = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const credential = auth.GoogleAuthProvider.credential(
      userInfo.idToken,
      userInfo.accessToken,
    );
    return auth()
      .signInWithCredential(credential)
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      Alert.alert('Sign in canceled');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      Alert.alert('Signin in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      Alert.alert('PLAY_SERVICES_NOT_AVAILABLE');
    } else {
      Alert.alert(JSON.stringify(error.message));
    }
  } };