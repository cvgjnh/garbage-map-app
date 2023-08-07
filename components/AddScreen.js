import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput, Modal, Alert, Check } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, {useState, useEffect} from 'react';
import MapView from 'react-native-maps';
import { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Realm from 'realm';
import {createRealmContext} from '@realm/react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

import { GoogleSignIn } from './GoogleSignIn';
import { set } from 'react-native-reanimated';
import CheckBox from '@react-native-community/checkbox';


export function AddScreen(props) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [position, setPosition] = useState(null);
    const [isTrash, setIsTrash] = useState(false);
    const [isBottles, setIsBottles] = useState(false);
    const [isCompost, setIsCompost] = useState(false);
    const [missing, setMissing] = useState([]);
    const [chooseOneWarning, setChooseOneWarning] = useState(false);

    const navigation = useNavigation();

  
    const handleFormSubmit = () => {
      setMissing([]);
      setChooseOneWarning(false);
      // You can perform form submission logic here
      if (!title) {
        setMissing(prevMissing => [...prevMissing, 'title']);
      }
      if (!description) {
        setMissing(prevMissing => [...prevMissing, 'description']);
      }
      if (!isTrash && !isBottles && !isCompost) {
        setChooseOneWarning(true);
      }
      if (missing.length > 0 || chooseOneWarning) {
        return;
      }

      console.log('Title:', title);
      console.log('Description:', description);

      firestore()
        .collection('markers')
        .add({
          title: title,
          description: description,  
          location: new firestore.GeoPoint(position.latitude, position.longitude),
          username: props.user.username,
          isTrash: isTrash,
          isBottles: isBottles,
          isCompost: isCompost,
        })
        .then((docRef) => {
          Alert.alert('Marker added!');
          setTitle('');
          setDescription('');
          setIsTrash(false);
          setIsBottles(false);
          setIsCompost(false);
          firestore()
            .collection('logs')
            .add({
              markerId: docRef.id,
              body: "Marker added!",
              createdAt: firestore.Timestamp.fromDate(new Date()),
              found: true,
              username: props.user.username,
            })
        })  
    };

    useEffect(() => {
        const centerOnUser = async () => {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
          }
    
          let location = await Location.getCurrentPositionAsync({});
          setPosition({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0421,
            longitudeDelta: 0.0421,
          });
        };
        centerOnUser();
    }, []);
    
  
    if (props.user) {
      return (
        
        // form to add a marker
        <View style={styles.container}>
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={{ flex: 1 }}>
                    {position &&
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={position}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                        followsUserLocation={true}
                        showsCompass={true}
                        scrollEnabled={true}
                        zoomEnabled={true}
                        pitchEnabled={true}
                        rotateEnabled={true}
                    >
                        <Marker
                            draggable
                            coordinate={position}
                            onDragEnd={e => {
                                setPosition({...e.nativeEvent.coordinate, latitudeDelta: 0.0421, longitudeDelta: 0.0421});
                                console.log(e.nativeEvent.coordinate);
                            }}
                        />
                    </MapView>
                    }
                    <Button title="Done" onPress={() => setModalVisible(!modalVisible)} />
                </View>
                {/* <Text>Modal</Text> */}
            </Modal>
            <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.input}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline={true}
            />
            <Text>Trash</Text>
            <CheckBox
              disabled={false}
              value={isTrash}
              onValueChange={(newValue) => setIsTrash(newValue)}
            />
            <Text>Bottles</Text>
            <CheckBox
              disabled={false}
              value={isBottles}
              onValueChange={(newValue) => setIsBottles(newValue)}
            />
            <Text>Compost</Text>
            <CheckBox
              disabled={false}
              value={isCompost}
              onValueChange={(newValue) => setIsCompost(newValue)}
            />
            {chooseOneWarning && 
              <Text>Please select at least one garbage category</Text>
            }
            <Button title="Select Location" onPress={() => setModalVisible(true)} />
            <Button title="Submit" onPress={handleFormSubmit} />
            {missing.length > 0 && 
                <Text>Missing Fields: {missing.join(', ')}</Text>
            }

        </View>
      )
    }
    else {
      
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Sign in to add a marker</Text>
          <Button title="Sign In" onPress={() => navigation.navigate('Profile')} />
          <GoogleSignIn />
        </View>
      )
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    input: {
      width: '100%',
      height: 40,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
      },
    modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    },
    button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    },
    buttonOpen: {
    backgroundColor: '#F194FF',
    },
    buttonClose: {
    backgroundColor: '#2196F3',
    },
    textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    },
    modalText: {
    marginBottom: 15,
    textAlign: 'center',
    },
    map: {
        flex:1
    },
  });

  