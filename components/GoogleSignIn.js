import { Alert, StyleSheet } from 'react-native'
import { Button } from 'react-native-paper'
import React from 'react'
import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin'
import auth from '@react-native-firebase/auth'

export function GoogleSignIn() {
    return (
        <Button
            onPress={() =>
                onGoogleButtonPress().then(() =>
                    console.log('Signed in with Google!')
                )
            }
            mode="outlined"
            icon="google"
        >
            Sign in with Google
        </Button>
    )
}

export function GoogleSignOut() {
    return (
        <Button
            onPress={async () => {
                const isSignedIn = await GoogleSignin.isSignedIn()
                if (isSignedIn) {
                    await GoogleSignin.revokeAccess()
                    await GoogleSignin.signOut()
                }
                await auth().signOut()
            }}
        >
            Sign out
        </Button>
    )
}

GoogleSignin.configure({
    webClientId:
        '451639436511-ii6eceujoj7ib8cchq6tnfd248d9afkg.apps.googleusercontent.com',
})

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
        await GoogleSignin.hasPlayServices()
        const userInfo = await GoogleSignin.signIn()
        const credential = auth.GoogleAuthProvider.credential(
            userInfo.idToken,
            userInfo.accessToken
        )
        return auth().signInWithCredential(credential)
    } catch (error) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            console.log('SIGN_IN_CANCELLED')
        } else if (error.code === statusCodes.IN_PROGRESS) {
            Alert.alert('Signin in progress')
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            Alert.alert('PLAY_SERVICES_NOT_AVAILABLE')
        } else {
            Alert.alert(JSON.stringify(error.message))
        }
    }
}
