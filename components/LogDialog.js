import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import {
  Text,
  Button,
  Dialog,
  Portal,
  TextInput,
  RadioButton,
} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import * as geofirestore from 'geofirestore';

export function LogDialog(props) {
  const [textEntry, setTextEntry] = useState('');
  const [found, setFound] = useState(true);

  const GeoFirestore = geofirestore.initializeApp(firestore());

  const handleSubmit = () => {
    props.setLogDialogOpen(false);
    firestore()
      .collection('logs')
      .add({
        markerId: props.selectedMarker.id,
        body: textEntry,
        createdAt: firestore.Timestamp.fromDate(new Date()),
        found,
        username: props.user.username,
        userId: props.user.uid,
      })
      .then((documentRef) => {
        return documentRef.get();
      })
      .then((documentSnapshot) => {
        setTextEntry('');
        props.setSelectedMarkerLogs((prevSelectedMarkerLogs) => [
          { ...documentSnapshot.data(), id: documentSnapshot.id },
          ...prevSelectedMarkerLogs,
        ]);
      })
      .then(() => {
        props.setUser({
          ...props.user,
          numCreatedLogs: props.user.numCreatedLogs + 1,
        });
      })
      .catch((error) => {
        console.log(
          'Something went wrong adding the log to the logs collection.',
          error
        );
      });
    if (found) {
      GeoFirestore.collection('markers')
        .doc(props.selectedMarker.id)
        .update({
          lastSeen: firestore.Timestamp.fromDate(new Date()),
        })
        .then(() => {
          console.log('Marker last seen updated!');
        })
        .catch((error) => {
          console.log('Something went wrong updating the marker.', error);
        });
    }
  };
  return (
    <Portal>
      <Dialog
        visible={props.logDialogOpen}
        dismissable={false}
        style={styles.dialog}
      >
        <Dialog.Title>Choose Log Type</Dialog.Title>
        <Dialog.Content>
          <RadioButton.Group
            onValueChange={(newValue) => setFound(newValue)}
            value={found}
          >
            <View style={styles.row}>
              <View style={styles.option}>
                <Text variant="titleMedium">Found it</Text>
                <RadioButton value />
              </View>
              <View style={styles.option}>
                <Text variant="titleMedium">Did not find it</Text>
                <RadioButton value={false} />
              </View>
            </View>
          </RadioButton.Group>

          <TextInput
            onChangeText={setTextEntry}
            value={textEntry}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            maxLength={500}
            placeholder="Provide some details to help others out!"
            label="(Optional) Log Entry"
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => props.setLogDialogOpen(false)}>
            {' '}
            Cancel{' '}
          </Button>
          <Button onPress={() => handleSubmit()}> Submit </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    zIndex: 10000,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  option: {
    alignItems: 'center',
  },
});
