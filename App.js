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
        colorScheme === 'dark'
            ? {
                  ...MD3DarkTheme,
                  colors: {
                      ...MD3DarkTheme.colors,
                      primary: '#96a683',
                      onPrimary: '#433124',
                      primaryContainer: '#2e3a2f',
                      onPrimaryContainer: '#8e7b6e',
                      surface: '#2e3a2f',
                      secondaryContainer: '#8e7b6e',
                  },
              }
            : {
                  ...MD3LightTheme,
                  colors: {
                      ...MD3LightTheme.colors,
                      primary: '#5e7161',
                      onPrimary: '#f6efe7',
                      primaryContainer: '#79695d',
                      onPrimaryContainer: '#433124',
                      surface: '#c0cfb9',
                      secondaryContainer: '#ae927c',
                  },
              }

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

    useEffect(() => {
        if (user) {
            firestore()
                .collection('logs')
                .where('userId', '==', user.uid)
                .count()
                .get()
                .then((snapshot) => {
                    setUser((prevUser) => {
                        return {
                            ...prevUser,
                            numCreatedLogs: snapshot.data().count,
                        }
                    })
                })
            firestore()
                .collection('markers')
                .where('userId', '==', user.uid)
                .count()
                .get()
                .then((snapshot) => {
                    setUser((prevUser) => {
                        return {
                            ...prevUser,
                            numCreatedMarkers: snapshot.data().count,
                        }
                    })
                })
        }
    }, [user?.uid])

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
                                theme={paperTheme}
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
//i love you harry hu
