import { StyleSheet, View, Image } from 'react-native'
import { Text, Button, FAB } from 'react-native-paper'
import React, { useState, useEffect, useRef } from 'react'
import MapView from 'react-native-maps'
import { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps'
import * as Location from 'expo-location'
import firestore from '@react-native-firebase/firestore'
import * as geofirestore from 'geofirestore'
import { MarkerModal } from './MarkerModal'
import { MarkerPreview } from './MarkerPreview'

import { MapTypeDialog } from './MapTypeDialog'
import { useNavigation } from '@react-navigation/native'
import 'react-native-gesture-handler'
import { set } from 'react-native-reanimated'

export function MapScreen(props) {
    const [currentRegion, setCurrentRegion] = useState(null)
    const [firstRender, setFirstRender] = useState(true)
    const [selectedMarker, setSelectedMarker] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [mapType, setMapType] = useState('hybrid')
    const [mapTypeDialogOpen, setMapTypeDialogOpen] = useState(false)
    const [loadMarkersButtonVisible, setLoadMarkersButtonVisible] =
        useState(false)
    const [loadingMarkers, setLoadingMarkers] = useState(false)
    const [loadMarkersToggle, setLoadMarkersToggle] = useState(false)
    const GeoFirestore = geofirestore.initializeApp(firestore())
    const mapRef = useRef(null)
    const navigation = useNavigation()

    async function centerOnUser() {
        console.log('center on user')
        let { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
            console.log('Permission to access location was denied')
            return
        }

        let location = await Location.getCurrentPositionAsync({})
        console.log('location: ', location)
        console.log(mapRef.current)
        mapRef.current.animateCamera(
            {
                center: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                },
            },
            { duration: 1000 }
        )
    }

    // issue with this not always executing - test on production build as well
    // handle the case where the user denies location permissions
    useEffect(() => {
        const centerOnUser = async () => {
            console.log('getting position...')
            let { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') {
                console.log('Permission to access location was denied')
                return
            }
            console.log('permissions granted')
            // could changing it to getLastKnownPositionAsync() help with the issue of the map sometimes not loading?
            let location = await Location.getLastKnownPositionAsync({})
            console.log('location: ', location)
            setCurrentRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0421,
                longitudeDelta: 0.001,
            })
        }

        centerOnUser()
    }, [])

    // useEffect(() => {
    //     if (initialRegion) updateMarkers(initialRegion)
    // }, [initialRegion])

    function handleMarkerPress(marker) {
        // if the info box is already open for this marker, close it
        if (selectedMarker === marker) {
            setSelectedMarker(null)
        }
        // if the info box is on another marker or its closed, open it and set the selected marker
        else {
            setSelectedMarker(marker)
        }
    }

    useEffect(() => {
        if (selectedMarker) {
            props.markers.forEach((marker) => {
                if (marker.id === selectedMarker.id) {
                    setSelectedMarker(marker)
                }
            })
        }
    }, [props.markers])

    useEffect(() => {
        if (!selectedMarker) return

        const unsubscribe = firestore()
            .collection('markers')
            .doc(selectedMarker.id)
            .onSnapshot((documentSnapshot) => {
                setSelectedMarker({
                    ...documentSnapshot.data(),
                    id: documentSnapshot.id,
                })
            })
        return () => {
            console.log('unsubscribed from marker')
            unsubscribe()
        }
    }, [selectedMarker?.id])

    // if I can combine the spatial query with a query to filter out markers that are already in the state, I can decrease requests to the database
    // However firestore doesn't support compound inequality queries, so I can't do that
    // Also need to find a way to remove deleted markers from the state
    // Could make markers a global state that can be updated by the delete marker function
    // Could also make retrieving markers a button that the user can press to update the markers (would save on a lot of reads but would be less responsive)
    // I think the manual retrieval of markers is the best option or else the app wouldn't be able to handle a lot of users
    // Potential for using onSnapshot? could make it so that we don't have to manually update marker state after every change
    // function updateMarkers(region) {
    //     const getMarkers = async () => {
    //         const newMarkers = []

    //         const markerDocuments = await GeoFirestore.collection('markers')
    //             .near({
    //                 center: new firestore.GeoPoint(
    //                     region.latitude,
    //                     region.longitude
    //                 ),
    //                 radius: ((region.latitudeDelta * Math.PI) / 180) * 6371,
    //             })
    //             .get()
    //         markerDocuments.forEach((documentSnapshot) => {
    //             newMarkers.push({
    //                 ...documentSnapshot.data(),
    //                 id: documentSnapshot.id,
    //             })
    //         })
    //         props.setMarkers(newMarkers)
    //     }

    //     getMarkers()
    // }

    useEffect(() => {
        if (!currentRegion) {
            return
        }

        let isInitialAdd = true

        unsubscribe = GeoFirestore.collection('markers')
            .near({
                center: new firestore.GeoPoint(
                    currentRegion.latitude,
                    currentRegion.longitude
                ),
                radius: ((currentRegion.latitudeDelta * Math.PI) / 180) * 6371,
            })
            .onSnapshot((snapshot) => {
                // on the initial snapshot, replace the markers state with the markers in the query
                if (isInitialAdd) {
                    let newMarkers = []
                    snapshot.forEach((documentSnapshot) => {
                        newMarkers.push({
                            ...documentSnapshot.data(),
                            id: documentSnapshot.id,
                        })
                    })
                    props.setMarkers(newMarkers)
                    isInitialAdd = false
                    setLoadingMarkers(false)
                    setLoadMarkersButtonVisible(false)
                } else {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            // if (
                            //     !props.markers.some(
                            //         (marker) => marker.id === change.doc.id
                            //     )
                            // ) {
                            //     props.setMarkers((prevMarkers) => [
                            //         { ...change.doc.data(), id: change.doc.id },
                            //         ...prevMarkers,
                            //     ])
                            // }
                            props.setMarkers((prevMarkers) => [
                                { ...change.doc.data(), id: change.doc.id },
                                ...prevMarkers,
                            ])
                        }

                        if (change.type === 'modified') {
                            console.log('modified')
                            props.setMarkers((prevMarkers) =>
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
                            console.log('removed')
                            props.setMarkers((prevMarkers) =>
                                prevMarkers.filter((marker) => {
                                    return marker.id !== change.doc.id
                                })
                            )
                        }
                    })
                }
            })
        console.log('subscribed to markers')

        return () => {
            unsubscribe()
            console.log('unsubscribed from markers')
        }
    }, [loadMarkersToggle])

    useEffect(() => {
        if (firstRender && currentRegion) {
            setFirstRender(false)
            setLoadMarkersToggle(!loadMarkersToggle)
        }
    }, [currentRegion])

    return (
        <>
            <MarkerModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                selectedMarker={selectedMarker}
                setSelectedMarker={setSelectedMarker}
                user={props.user}
                setUser={props.setUser}
            />
            {selectedMarker && (
                <MarkerPreview
                    selectedMarker={selectedMarker}
                    setModalVisible={setModalVisible}
                />
            )}
            {loadMarkersButtonVisible && (
                <Button
                    style={styles.loadMarkersButton}
                    onPress={() => {
                        // updateMarkers(currentRegion)
                        setLoadMarkersToggle(!loadMarkersToggle)
                        setLoadingMarkers(true)
                    }}
                    mode="contained"
                    loading={loadingMarkers}
                >
                    Load Markers for this Area
                </Button>
            )}
            <View style={{ flex: 1 }}>
                {currentRegion ? (
                    <>
                        <View style={styles.fabBar}>
                            <FAB
                                style={styles.fab}
                                icon="crosshairs-gps"
                                size="medium"
                                onPress={() => centerOnUser()}
                            />
                            <FAB
                                style={styles.fab}
                                icon="map"
                                size="medium"
                                onPress={() => setMapTypeDialogOpen(true)}
                            />
                            <FAB
                                style={styles.fab}
                                icon="plus"
                                size="medium"
                                onPress={() => {
                                    if (!props.user) {
                                        navigation.navigate('Profile')
                                        return
                                    }
                                    navigation.navigate('Add', {
                                        user: props.user,
                                        setUser: props.setUser,
                                        setMarkers: props.setMarkers,
                                    })
                                }}
                            />
                        </View>

                        <MapTypeDialog
                            dialogVisible={mapTypeDialogOpen}
                            setDialogVisible={setMapTypeDialogOpen}
                            mapType={mapType}
                            setMapType={setMapType}
                        />
                        <MapView
                            ref={mapRef}
                            provider={PROVIDER_GOOGLE}
                            style={styles.map}
                            initialRegion={currentRegion}
                            showsUserLocation={true}
                            showsMyLocationButton={false}
                            showsCompass={true}
                            scrollEnabled={true}
                            zoomEnabled={true}
                            pitchEnabled={false}
                            loadingEnabled={true}
                            mapType={mapType}
                            paddingAdjustmentBehavior="always"
                            toolbarEnabled={false}
                            onPress={() => {
                                setSelectedMarker(null)
                            }}
                            minZoomLevel={15}
                            onRegionChangeComplete={(region, _) => {
                                setLoadMarkersButtonVisible(true)
                                setCurrentRegion(region)
                            }}
                        >
                            {props.markers.map((marker) => {
                                // I can only have one image per marker so if I represented each trash type in the marker icon,
                                // I would have to have a different image for each combination of trash types
                                // With four trash types, that would be 15 images and if I ever changed the style, I would have to change all 15 images
                                return (
                                    <Marker
                                        key={marker.id}
                                        coordinate={{
                                            latitude:
                                                marker.coordinates.latitude,
                                            longitude:
                                                marker.coordinates.longitude,
                                        }}
                                        onPress={() => {
                                            handleMarkerPress(marker)
                                        }}
                                        tappable={false}
                                    >
                                        {/* <Image
                                            source={require('../assets/trash_test.png')}
                                            style={{ width: 50, height: 50 }}
                                        /> */}

                                        <Callout tooltip={true}>
                                            <Text></Text>
                                        </Callout>
                                    </Marker>
                                )
                            })}
                        </MapView>
                    </>
                ) : (
                    <Text>Loading...</Text>
                )}
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // alignItems: 'center',
        justifyContent: 'center',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    infoBox: {
        backgroundColor: 'white',
        bottom: 10,
        left: 10,
        right: 10,
        borderWidth: 1,
        zIndex: 100,
        position: 'absolute',
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: 'bold',
        fontSize: 20,
    },
    imageBox: {
        width: 300,
        height: 300,
        alignSelf: 'center',
    },
    fab: {
        margin: 5,
    },
    fabBar: {
        position: 'absolute',
        zIndex: 100,
        right: 0,
        top: 5,
        flexDirection: 'column',
    },
    loadMarkersButton: {
        position: 'absolute',
        zIndex: 100,
        alignSelf: 'center',
        margin: 10,
    },
})
