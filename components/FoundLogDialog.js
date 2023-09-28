import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import Dialog from 'react-native-dialog'
import firestore from '@react-native-firebase/firestore'

export function FoundLogDialog(props) {
    const [textEntry, setTextEntry] = useState('')

    const handleSubmit = () => {
        props.setFoundLogOpen(false)
        firestore()
            .collection('logs')
            .add({
                markerId: props.selectedMarker.id,
                body: textEntry,
                createdAt: firestore.Timestamp.fromDate(new Date()),
                found: true,
                // want to display the username when the log is displayed but the username can be changed
                // if the uid is stored in the log, we can query firestore for the up-to-date username but that would double the number of reads per log
                // storing the uid would also allow navigation to the user's profile in the future
                // maybe better to store the username in the log and update all the user's logs if the user changes their username
                username: props.user.username,
            })
            .then((documentRef) => {
                console.log('Log added!')
                props.setUser({
                    ...props.user,
                    numCreatedLogs: props.user.numCreatedLogs + 1,
                })
                return documentRef.get()
            })
            .then((documentSnapshot) => {
                setTextEntry('')
                props.setSelectedMarkerLogs((prevSelectedMarkerLogs) => [
                    { ...documentSnapshot.data(), id: documentSnapshot.id },
                    ...prevSelectedMarkerLogs,
                ])
            })
            .catch((error) => {
                console.log(
                    'Something went wrong adding the log to the logs collection.',
                    error
                )
            })
        firestore()
            .collection('markers')
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
    return (
        <View>
            <Dialog.Container visible={props.foundLogOpen}>
                <Dialog.Title style={styles.text}>
                    (Optional) Write a log entry!
                </Dialog.Title>
                <Dialog.Input
                    onChangeText={setTextEntry}
                    value={textEntry}
                    multiline={true}
                    numberOfLines={8}
                    textAlignVertical="top"
                    maxLength={500}
                    style={styles.text}
                />
                <Dialog.Button
                    label="Cancel"
                    onPress={() => props.setFoundLogOpen(false)}
                />
                <Dialog.Button label="Submit" onPress={() => handleSubmit()} />
            </Dialog.Container>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        color: 'black',
    },
})
