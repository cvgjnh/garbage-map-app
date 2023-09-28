import { StyleSheet, View, Pressable } from 'react-native'
import {
    Text,
    Button,
    Drawer,
    Menu,
    Dialog,
    Portal,
    Divider,
    Surface,
} from 'react-native-paper'
import React, { useState, useEffect } from 'react'
import firestore from '@react-native-firebase/firestore'
import { CreatedMarkersListItem } from './CreatedMarkersListItem'
import { MarkerModal } from './MarkerModal'
import { set } from 'react-native-reanimated'
import storage from '@react-native-firebase/storage'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export function CreatedMarkersList(props) {
    const [createdMarkerListOpen, setCreatedMarkerListOpen] = useState(false)
    const [createdMarkers, setCreatedMarkers] = useState([])
    const [modalVisible, setModalVisible] = useState(false)
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)

    const deleteMarker = (marker) => {
        storage()
            .ref(marker.image)
            .delete()
            .then(() => {
                console.log('Image deleted!')
            })
        firestore()
            .collection('markers')
            .doc(marker.id)
            .delete()
            .then(() => {
                console.log('Marker deleted!')
                firestore()
                    .collection('users')
                    .doc(props.user.uid)
                    .update({
                        numCreatedMarkers: props.user.numCreatedMarkers - 1,
                    })
            })
            .then(() => {
                props.setUser({
                    ...props.user,
                    numCreatedMarkers: props.user.numCreatedMarkers - 1,
                })
                setDeleteDialogVisible(false)
            })

        // could delete logs for the deleted marker but this would just be a waste of reads
        // logs don't take up much space in firestore anyways

        // firestore()
        //     .collection('logs')
        //     .where('markerId', '==', marker.id)
        //     .get()
        //     .then((querySnapshot) => {
        //         querySnapshot.forEach((doc) => {
        //             doc.ref.delete()
        //         })
        //     })
        //     .then(() => {
        //         console.log('Logs deleted!')
        //     }
        //     )
    }

    useEffect(() => {
        setCreatedMarkers([])
        const unsubscribe = firestore()
            .collection('markers')
            .where('userId', '==', props.user.uid)
            .orderBy('createdAt', 'asc')
            .onSnapshot(
                (snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            setCreatedMarkers((prevMarkers) => [
                                { ...change.doc.data(), id: change.doc.id },
                                ...prevMarkers,
                            ])
                        }
                        if (change.type === 'modified') {
                            setCreatedMarkers((prevMarkers) =>
                                prevMarkers.map((marker) => {
                                    if (marker.id === change.doc.id) {
                                        return {
                                            ...change.doc.data(),
                                            id: change.doc.id,
                                        }
                                    } else {
                                        return marker
                                    }
                                })
                            )
                        }
                        if (change.type === 'removed') {
                            setCreatedMarkers((prevMarkers) =>
                                prevMarkers.filter(
                                    (marker) => marker.id !== change.doc.id
                                )
                            )
                        }
                    })
                },
                (err) => {
                    console.log(`Encountered error: ${err}`)
                }
            )

        return () => unsubscribe()
    }, [props.user.username])

    return (
        <>
            <MarkerModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                selectedMarker={props.selectedMarker}
                user={props.user}
                setUser={props.setUser}
            />
            <Portal>
                <Dialog visible={deleteDialogVisible} dismissable={false}>
                    <Dialog.Title>
                        Are you sure you want to delete{' '}
                        {props.selectedMarker && props.selectedMarker.title}?
                        This cannot be undone.
                    </Dialog.Title>
                    <Dialog.Actions>
                        <Button onPress={() => setDeleteDialogVisible(false)}>
                            Cancel
                        </Button>
                        <Button
                            onPress={() => deleteMarker(props.selectedMarker)}
                        >
                            Delete
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <Pressable
                onPress={() => {
                    // console.log(createdMarkers)
                    setCreatedMarkerListOpen(!createdMarkerListOpen)
                }}
            >
                <Surface elevation={1} style={styles.dropdown}>
                    <Text variant="labelLarge">
                        {createdMarkerListOpen
                            ? 'Hide Created Markers'
                            : 'Show Created Markers'}
                    </Text>
                    <Icon
                        name={
                            createdMarkerListOpen
                                ? 'chevron-up'
                                : 'chevron-down'
                        }
                        size={20}
                        style={styles.chevron}
                    />
                </Surface>
            </Pressable>
            {createdMarkerListOpen && (
                <View>
                    {createdMarkers.map((marker) => {
                        return (
                            <CreatedMarkersListItem
                                key={marker.id}
                                user={props.user}
                                marker={marker}
                                setSelectedMarker={props.setSelectedMarker}
                                setModalVisible={setModalVisible}
                                setDeleteDialogVisible={setDeleteDialogVisible}
                            />
                        )
                    })}
                </View>
            )}
        </>
    )
}

const styles = StyleSheet.create({
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        width: '100%',
    },
    chevron: {
        position: 'absolute',
        right: 10,
    },
})
