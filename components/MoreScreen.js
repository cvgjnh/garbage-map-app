import { StyleSheet, View, ScrollView, Alert } from 'react-native'
import {
    Text,
    FAB,
    TextInput,
    Dialog,
    Button,
    Surface,
} from 'react-native-paper'
import React, { useState, useEffect } from 'react'
import firestore from '@react-native-firebase/firestore'

export function MoreScreen(props) {
    const [textFeedback, setTextFeedback] = useState('')
    function submitFeedback() {
        if (textFeedback === '') {
            return
        }
        firestore()
            .collection('feedback')
            .add({
                body: textFeedback,
                createdAt: firestore.Timestamp.fromDate(new Date()),
                user: props.user ? props.user.uid : 'anonymous',
            })
            .then((documentRef) => {
                Alert.alert('Feedback successfully submitted!', '', [
                    { text: 'OK' },
                ])
                setTextFeedback('')
            })
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Surface style={styles.container}>
                <Text variant="headlineMedium">About This App</Text>
                <Text variant="bodyLarge">
                    This app was created and will be maintained as a
                    not-for-profit personal project by myself, Harry. {'\n\n'} I
                    was inspired by the lack of public garbage cans when I
                    visited Japan, and thought that maybe I could turn this idea
                    into a fun project which could also help others. The d{'\n'}
                </Text>
                <Text variant="headlineMedium">Feedback</Text>
                <Text variant="bodyLarge">
                    Any feedback is greatly appreciated - I read every message!
                    Submit your suggestions, bug reports, or anything else you
                    want to say here.
                </Text>
                <TextInput
                    multiline={true}
                    value={textFeedback}
                    onChangeText={setTextFeedback}
                    numberOfLines={6}
                    mode="outlined"
                />

                {/* <FAB icon="send" onPress={() => submitFeedback()} /> */}
                <Button
                    onPress={() => submitFeedback()}
                    style={styles.submitButton}
                    mode="contained"
                >
                    Submit
                </Button>
            </Surface>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 10,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerBox: {
        margin: 20,
        flex: 1,
    },
    submitButton: {
        right: 0,
        width: '30%',
        alignSelf: 'flex-end',
    },
})
