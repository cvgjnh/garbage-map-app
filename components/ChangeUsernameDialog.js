import { StyleSheet, View } from 'react-native';
import { Text, Button, Dialog, Portal, TextInput } from 'react-native-paper';
import React, { useState, useContext } from 'react';
import firestore from '@react-native-firebase/firestore';
import { UserContext } from '../UserContext';

export function ChangeUsernameDialog(props) {
  const [username, setUsername] = useState('');
  const [usernameExists, setUsernameExists] = useState(false);
  const { user, setUser } = useContext(UserContext);

  const usernameMaxLength = 12;

  const changeUsername = async () => {
    if (username === user.username) {
      props.setEditingUsername(false);
      setUsernameExists(false);
      return;
    }

    // query firestore for username
    // if username exists, alert user
    // else, update username in firestore
    const usersRef = firestore().collection('users');
    const usernameSnapshot = await usersRef
      .where('username', '==', username)
      .count()
      .get();

    if (usernameSnapshot.data().count > 0) {
      setUsernameExists(true);
      return;
    }

    setUsernameExists(true);
    firestore()
      .collection('users')
      .doc(user.uid)
      .update({
        username,
      })
      .then(() => {
        console.log('Username updated in user profile!');
      });
    firestore()
      .collection('markers')
      .where('userId', '==', user.uid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((documentSnapshot) => {
          firestore().collection('markers').doc(documentSnapshot.id).update({
            username,
          });
        });
      })
      .then(() => {
        console.log('Username updated in markers!');
      });
    firestore()
      .collection('logs')
      .where('userId', '==', user.uid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((documentSnapshot) => {
          firestore().collection('logs').doc(documentSnapshot.id).update({
            username,
          });
        });
      })
      .then(() => {
        console.log('Username updated in logs!');
      });

    setUser((prevUser) => ({ ...prevUser, username }));
    props.setEditingUsername(false);
  };
  return (
    <View>
      <Portal>
        <Dialog visible={props.editingUsername} dismissable={false}>
          <Dialog.Title>Choose a unique username</Dialog.Title>
          <Dialog.Content onChangeText={setUsername} value={username}>
            <TextInput
              value={username}
              onChangeText={(text) => setUsername(text)}
              maxLength={usernameMaxLength}
            />
            <Text style={styles.textLimit}>
              {username.length}/{usernameMaxLength}
            </Text>
            {usernameExists ? (
              <Text variant="labelLarge" style={styles.warning}>
                Username already exists!
              </Text>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => props.setEditingUsername(false)}>
              {' '}
              Cancel{' '}
            </Button>
            <Button onPress={() => changeUsername()}> Done </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  warning: {
    color: 'red',
  },
  textLimit: {
    alignSelf: 'flex-end',
  },
});
