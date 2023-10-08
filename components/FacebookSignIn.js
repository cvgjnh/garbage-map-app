import auth from '@react-native-firebase/auth';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

import React from 'react';
import { Button } from 'react-native-paper';

// currently unused
export function FacebookSignIn() {
  return (
    <Button
      onPress={() =>
        onFacebookButtonPress().then(() =>
          console.log('Signed in with Facebook!')
        )
      }
    >
      Sign in with Facebook
    </Button>
  );
}

async function onFacebookButtonPress() {
  // Attempt login with permissions
  const result = await LoginManager.logInWithPermissions([
    'public_profile',
    'email',
  ]);

  if (result.isCancelled) {
    console.log('User cancelled the login process');
  }

  // Once signed in, get the users AccessToken
  const data = await AccessToken.getCurrentAccessToken();

  if (!data) {
    console.log('Something went wrong obtaining access token');
  }

  // Create a Firebase credential with the AccessToken
  const facebookCredential = auth.FacebookAuthProvider.credential(
    data.accessToken
  );

  // Sign-in the user with the credential
  return auth().signInWithCredential(facebookCredential);
}
