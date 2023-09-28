import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'

import {
    Text,
    Button,
    Dialog,
    Portal,
    TextInput,
    RadioButton,
} from 'react-native-paper'
import firestore from '@react-native-firebase/firestore'
import * as geofirestore from 'geofirestore'

export function LogDialog(props) {
    const [textEntry, setTextEntry] = useState('')
    const [found, setFound] = useState(true)

    const GeoFirestore = geofirestore.initializeApp(firestore())

    const handleSubmit = () => {
        props.setLogDialogOpen(false)
        firestore()
            .collection('logs')
            .add({
                markerId: props.selectedMarker.id,
                body: textEntry,
                createdAt: firestore.Timestamp.fromDate(new Date()),
                found: found,
                // want to display the username when the log is displayed but the username can be changed
                // if the uid is stored in the log, we can query firestore for the up-to-date username but that would double the number of reads per log
                // storing the uid would also allow navigation to the user's profile in the future
                // maybe better to store the username in the log and update all the user's logs if the user changes their username
                username: props.user.username,
                userId: props.user.uid,
            })
            .then((documentRef) => {
                console.log('Log added!')

                return documentRef.get()
            })
            .then((documentSnapshot) => {
                setTextEntry('')
                props.setSelectedMarkerLogs((prevSelectedMarkerLogs) => [
                    { ...documentSnapshot.data(), id: documentSnapshot.id },
                    ...prevSelectedMarkerLogs,
                ])
            })
            .then(() => {
                firestore()
                    .collection('users')
                    .doc(props.user.uid)
                    .update({
                        numCreatedLogs: props.user.numCreatedLogs + 1,
                    })
            })
            .then(() => {
                props.setUser({
                    ...props.user,
                    numCreatedLogs: props.user.numCreatedLogs + 1,
                })
            })
            .catch((error) => {
                console.log(
                    'Something went wrong adding the log to the logs collection.',
                    error
                )
            })
        if (found) {
            GeoFirestore.collection('markers')
                .doc(props.selectedMarker.id)
                .update({
                    lastSeen: firestore.Timestamp.fromDate(new Date()),
                })
                .then(() => {
                    if (props.selectedMarker) {
                        props.setSelectedMarker({
                            ...props.selectedMarker,
                            lastSeen: firestore.Timestamp.fromDate(new Date()),
                        })
                    }
                })
                .then(() => {
                    console.log('Marker lastSeen field updated!')
                })
                .catch((error) => {
                    console.log(
                        'Something went wrong updating the marker lastSeen field.',
                        error
                    )
                })
        }
    }
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
                                <RadioButton value={true} />
                            </View>
                            <View style={styles.option}>
                                <Text variant="titleMedium">
                                    Did not find it
                                </Text>
                                <RadioButton value={false} />
                            </View>
                        </View>
                    </RadioButton.Group>

                    <TextInput
                        onChangeText={setTextEntry}
                        value={textEntry}
                        multiline={true}
                        numberOfLines={8}
                        textAlignVertical="top"
                        maxLength={500}
                        placeholder={'Provide some details to help others out!'}
                        label={'(Optional) Log Entry'}
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
    )
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
})
