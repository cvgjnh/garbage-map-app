import { StatusBar } from 'expo-status-bar'
import {
    StyleSheet,
    useColorScheme,
    LogBox,
    View,
    SafeAreaView,
} from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import React, { useState, useEffect, createContext } from 'react'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { MapScreen } from './components/MapScreen'
import { AddScreen } from './components/AddScreen'
import { MapAddScreen } from './components/MapAddScreen'
import { ProfileScreen } from './components/ProfileScreen'
import { MoreScreen } from './components/MoreScreen'
import { MD3LightTheme, MD3DarkTheme, PaperProvider } from 'react-native-paper'
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation'

const Tab = createMaterialBottomTabNavigator()
const UserContext = createContext()

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
])

export default function App() {
    const [user, setUser] = useState(null)
    const [markers, setMarkers] = useState([])

    const colorScheme = useColorScheme()

    const paperTheme =
        colorScheme === 'dark' ? { ...MD3DarkTheme } : { ...MD3LightTheme }

    // const paperTheme = {
    //     ...MD3LightTheme,
    //     colors: { ...MD3LightTheme.colors },
    // }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
        return subscriber
    }, [])

    function onAuthStateChanged(user) {
        if (user) {
            const uid = user.uid
            const data = {
                uid: uid,
                email: user.email,
                username: uid.substring(0, 8),
                numCreatedMarkers: 0,
                numCreatedLogs: 0,
            }
            const usersRef = firestore().collection('users')
            usersRef
                .doc(uid)
                .get()
                .then((firestoreDocument) => {
                    if (!firestoreDocument.exists) {
                        usersRef.doc(data.uid).set(data)
                        setUser(data)
                    } else {
                        setUser(firestoreDocument.data())
                    }
                })
                .catch((error) => {
                    console.log('Error getting document:', error)
                })
        } else {
            setUser(null)
        }
    }

    return (
        <PaperProvider theme={paperTheme}>
            <UserContext.Provider value={{ user, setUser }}>
                <StatusBar
                    translucent={false}
                    backgroundColor={paperTheme.colors.surface}
                />
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <NavigationContainer>
                            <Tab.Navigator
                                screenOptions={({ route }) => ({
                                    tabBarIcon: () => {
                                        let iconName
                                        size = 24

                                        if (route.name === 'MapAdd') {
                                            iconName = 'map-marker'
                                        } else if (route.name === 'Profile') {
                                            iconName = 'account'
                                        } else if (route.name === 'More') {
                                            iconName = 'lightbulb'
                                        }

                                        // You can return any component that you like here!
                                        return (
                                            <Icon
                                                name={iconName}
                                                size={size}
                                                color={
                                                    paperTheme.colors.primary
                                                }
                                            />
                                        )
                                    },
                                })}
                                barStyle={{
                                    backgroundColor: paperTheme.colors.surface,
                                    paddingBottom: -48,
                                }}
                                activeColor={paperTheme.colors.primary}
                                inactiveColor={paperTheme.colors.primary}
                            >
                                {/* <Tab.Screen
                        name="Map"
                        children={() => (
                            <MapScreen
                                user={user}
                                setUser={setUser}
                                markers={markers}
                                setMarkers={setMarkers}
                            />
                        )}
                    />
                    <Tab.Screen
                        name="Add"
                        children={() => (
                            <AddScreen
                                user={user}
                                setUser={setUser}
                                onAuthStateChanged={onAuthStateChanged}
                                setMarkers={setMarkers}
                            />
                        )}
                    /> */}
                                <Tab.Screen
                                    name="MapAdd"
                                    children={() => (
                                        <MapAddScreen
                                            user={user}
                                            setUser={setUser}
                                            markers={markers}
                                            setMarkers={setMarkers}
                                        />
                                    )}
                                />

                                <Tab.Screen
                                    name="Profile"
                                    children={() => (
                                        <ProfileScreen
                                            user={user}
                                            setUser={setUser}
                                            setMarkers={setMarkers}
                                            onAuthStateChanged={
                                                onAuthStateChanged
                                            }
                                        />
                                    )}
                                />
                                <Tab.Screen
                                    name="More"
                                    children={() => <MoreScreen user={user} />}
                                />
                            </Tab.Navigator>
                        </NavigationContainer>
                    </View>
                </SafeAreaView>
            </UserContext.Provider>
        </PaperProvider>
    )
}
