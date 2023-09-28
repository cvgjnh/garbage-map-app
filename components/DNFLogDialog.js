import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import Dialog from 'react-native-dialog'
import firestore from '@react-native-firebase/firestore'

export function DNFLogDialog(props) {
    const [textEntry, setTextEntry] = useState('')

    const handleSubmit = () => {
        props.setDNFLogOpen(false)

        firestore()
            .collection('logs')
            .add({
                markerId: props.selectedMarker.id,
                body: textEntry,
                createdAt: firestore.Timestamp.fromDate(new Date()),
                found: false,
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
    }
    return (
        <View>
            <Dialog.Container visible={props.DNFLogOpen}>
                <Dialog.Title style={styles.text}>
                    (Optional) Write a log entry!
                </Dialog.Title>
                <Dialog.Input
                    style={styles.text}
                    onChangeText={setTextEntry}
                    value={textEntry}
                    multiline={true}
                    numberOfLines={8}
                    textAlignVertical="top"
                    maxLength={500}
                />
                <Dialog.Button
                    label="Cancel"
                    onPress={() => props.setDNFLogOpen(false)}
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
