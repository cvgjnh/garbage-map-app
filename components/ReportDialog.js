import React, { useState } from 'react'
import { View, StyleSheet, Alert } from 'react-native'

import {
    Text,
    Button,
    Dialog,
    Portal,
    TextInput,
    RadioButton,
    Checkbox,
} from 'react-native-paper'
import firestore from '@react-native-firebase/firestore'
import * as geofirestore from 'geofirestore'

export function ReportDialog(props) {
    const [textEntry, setTextEntry] = useState('')
    const [inappropriateTitle, setInappropriateTitle] = useState(false)
    const [inappropriateDescription, setInappropriateDescription] =
        useState(false)
    const [inappropriateImage, setInappropriateImage] = useState(false)
    const [notPublicWasteBin, setNotPublicWasteBin] = useState(false)
    const [chooseOneWarning, setChooseOneWarning] = useState(false)

    const handleSubmit = () => {
        if (
            !inappropriateTitle &&
            !inappropriateDescription &&
            !inappropriateImage &&
            !notPublicWasteBin
        ) {
            setChooseOneWarning(true)
            return
        }
        firestore()
            .collection('reports')
            .add({
                markerReference: firestore()
                    .collection('markers')
                    .doc(props.selectedMarker.id),
                createdAt: firestore.Timestamp.fromDate(new Date()),
                inappropriateTitle: inappropriateTitle,
                inappropriateDescription: inappropriateDescription,
                inappropriateImage: inappropriateImage,
                notPublicWasteBin: notPublicWasteBin,
                details: textEntry,
                username: props.user ? props.user.username : 'anonymous',
            })
            .then((documentRef) => {
                Alert.alert('Report successfully submitted!', '', [
                    { text: 'OK' },
                ])
                clearFieldsAndClose()
            })
    }

    const clearFieldsAndClose = () => {
        setTextEntry('')
        setInappropriateTitle(false)
        setInappropriateDescription(false)
        setInappropriateImage(false)
        setNotPublicWasteBin(false)
        setChooseOneWarning(false)
        props.setReportDialogOpen(false)
    }

    return (
        <Portal>
            <Dialog
                visible={props.reportDialogOpen}
                dismissable={false}
                style={styles.dialog}
            >
                <Dialog.Title>
                    Report inappropriate marker characteristics
                </Dialog.Title>
                <Dialog.Content>
                    <View style={styles.row}>
                        <Checkbox
                            status={
                                inappropriateTitle ? 'checked' : 'unchecked'
                            }
                            onPress={() => {
                                setInappropriateTitle(!inappropriateTitle)
                            }}
                        />
                        <Text variant="labelLarge"> Inappropriate Title</Text>
                    </View>
                    <View style={styles.row}>
                        <Checkbox
                            status={
                                inappropriateImage ? 'checked' : 'unchecked'
                            }
                            onPress={() => {
                                setInappropriateImage(!inappropriateImage)
                            }}
                        />
                        <Text variant="labelLarge"> Inappropriate Image</Text>
                    </View>
                    <View style={styles.row}>
                        <Checkbox
                            status={
                                inappropriateDescription
                                    ? 'checked'
                                    : 'unchecked'
                            }
                            onPress={() => {
                                setInappropriateDescription(
                                    !inappropriateDescription
                                )
                            }}
                        />
                        <Text variant="labelLarge">
                            {' '}
                            Inappropriate Description
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Checkbox
                            status={notPublicWasteBin ? 'checked' : 'unchecked'}
                            onPress={() => {
                                setNotPublicWasteBin(!notPublicWasteBin)
                            }}
                        />
                        <Text variant="labelLarge">
                            {' '}
                            Not a Public Waste Bin
                        </Text>
                    </View>
                    {chooseOneWarning && (
                        <Text style={styles.warning} variant="labelLarge">
                            Please select at least one inappropriate
                            characteristic to submit a report
                        </Text>
                    )}

                    <TextInput
                        onChangeText={setTextEntry}
                        value={textEntry}
                        multiline={true}
                        numberOfLines={8}
                        textAlignVertical="top"
                        maxLength={500}
                        label={'(Optional) Provide more details.'}
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => clearFieldsAndClose()}>
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
        gap: 10,
        alignItems: 'center',
    },
    option: {
        alignItems: 'center',
    },
    warning: {
        color: 'red',
    },
})
